import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { ResolvedConfig, ViteDevServer } from 'vite';
import { stringify } from 'flatted';
import fs from 'node:fs/promises';

// Типы для событий
interface ViteEvent {
  id: string;
  type: 'hmr' | 'connection' | 'error' | 'transform' | 'middleware' | 'module';
  timestamp: number;
  data: Record<string, unknown>;
}

// Хранилище событий (в памяти, с лимитом)
const MAX_EVENTS = 500;
const events: ViteEvent[] = [];

function addEvent(type: ViteEvent['type'], data: Record<string, unknown>) {
  const event: ViteEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    timestamp: Date.now(),
    data
  };
  
  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }
  
  return event;
}

export function setupServer(
  rpc: RpcServerInterface,
  _ctx: ServerContext,
  viteData: { config: ResolvedConfig; server: ViteDevServer }
) {
  const { config, server } = viteData;
  
  // Проверка наличия сервера и moduleGraph
  if (!server) {
    console.error('[Vite Inspector] Vite server not provided');
    return;
  }
  
  if (!server.moduleGraph) {
    console.warn('[Vite Inspector] Module graph not available yet');
  }

  try {
    // 1. Основная информация
    rpc.handle('vite:info', async () => {
      let viteVersion = 'unknown';
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pkg = await import('vite/package.json' as any);
        viteVersion = pkg.default?.version || pkg.version || 'unknown';
      } catch {
        // Fallback
      }

      return {
        version: viteVersion,
        nodeVersion: process.version,
        root: config.root,
        base: config.base,
        mode: config.mode,
        configFile: config.configFile || null,
        cacheDir: config.cacheDir,
        urls: server?.resolvedUrls || {},
      };
    });

    // 2. Конфигурация (очищенная)
    rpc.handle('vite:config', () => {
      const { plugins, ...rest } = config;
      // Flatted позволяет сериализовать циклические ссылки
      try {
        return JSON.parse(stringify(rest));
      } catch {
        // Если не получилось, возвращаем упрощенную версию
        return {
          root: rest.root,
          base: rest.base,
          mode: rest.mode,
          build: rest.build,
          server: rest.server,
        };
      }
    });

    // Список стандартных хуков Vite и Rollup для отслеживания
    const KNOWN_HOOKS = [
    // Universal / Rollup
    'options', 'buildStart', 'resolveId', 'load', 'transform', 'buildEnd', 'closeBundle',
    // Vite Specific
    'config', 'configResolved', 'configureServer', 'transformIndexHtml', 'handleHotUpdate'
    ];

    // 3. Плагины (Detailed)
    rpc.handle('vite:plugins', () => {
      const plugins = config.plugins || [];
      
      return plugins
        // Фильтруем пустые/ложные плагины
        .filter((p: unknown) => p && typeof p === 'object')
        .map((p: unknown, index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plugin = p as any;
          
          // Определяем, какие хуки используются
          const activeHooks = KNOWN_HOOKS.filter(hook => {
            const hookValue = plugin[hook];
            // Хук может быть функцией или объектом { handler: ..., order: ... }
            return typeof hookValue === 'function' || 
                   (typeof hookValue === 'object' && typeof hookValue?.handler === 'function');
          });

          return {
            index,
            name: plugin.name || '(anonymous)',
            enforce: plugin.enforce || '-',
            apply: typeof plugin.apply === 'function' ? 'function' : plugin.apply || 'serve/build',
            version: plugin.version || undefined, // Некоторые плагины указывают версию
            activeHooks // Список активных хуков
          };
        });
    });

    // 4. Build/Server Stats
    rpc.handle('vite:stats', () => {
      if (!server?.moduleGraph) return null;

      const stats = {
        modules: 0,
        requests: 0,
        types: {} as Record<string, number>
      };

      // Анализ графа модулей
      server.moduleGraph.idToModuleMap.forEach((mod) => {
        stats.modules++;
        
        // Определяем тип файла по расширению
        const file = mod.file || mod.id || '';
        const ext = file.split('.').pop() || 'unknown';
        // Группируем (ts, vue, js, css...) и убираем query params
        const type = ext.split('?')[0].toLowerCase();
        stats.types[type] = (stats.types[type] || 0) + 1;
      });

      return stats;
    });

    // 5. Module Graph (Список всех файлов)
    rpc.handle('vite:modules:list', (payload: unknown) => {
      if (!server?.moduleGraph) {
        console.warn('[Vite Inspector] Module graph not available');
        return [];
      }
      
      const filter = payload as string | undefined;
      const modules: Array<{
        id: string;
        file: string | null;
        type: string;
        acceptedHmr: boolean;
        importers: number;
      }> = [];
      const search = filter?.toLowerCase() || '';
      
      // Итерируемся по Map (id -> module)
      server.moduleGraph.idToModuleMap.forEach((mod, id) => {
        // Фильтрация
        if (search && !id.toLowerCase().includes(search)) return;
        
        // Исключаем виртуальные модули самого девтулза, чтобы не шуметь
        if (id.includes('u-devtools') || id.includes('virtual:u-devtools')) return;

        modules.push({
          id,
          file: mod.file,
          type: mod.type || 'unknown',
          acceptedHmr: mod.isSelfAccepting || false,
          importers: mod.importers.size
        });
      });

      // Сортировка и лимит, чтобы не забить канал
      return modules.slice(0, 500);
    });

    // 6. Module Details & Transformation (Исходник vs Результат)
    rpc.handle('vite:modules:read', async (payload: unknown) => {
      const id = payload as string;
      const mod = server.moduleGraph.getModuleById(id);
      if (!mod) throw new Error('Module not found');

      // Исходный код (с диска)
      let source = '';
      try {
        if (mod.file) {
          source = await fs.readFile(mod.file, 'utf-8');
        } else {
          source = '// Source not available (virtual module)';
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        source = `// Error reading source: ${error}`;
      }

      // Трансформированный код (то, что Vite отдает браузеру)
      let transformed = '';
      try {
        // Используем pluginContainer для получения трансформированного кода
        const loadResult = await server.pluginContainer.load(id);
        let codeToTransform = '';
        
        if (loadResult) {
          // loadResult может быть строкой или объектом SourceDescription
          if (typeof loadResult === 'string') {
            codeToTransform = loadResult;
          } else if (loadResult && typeof loadResult === 'object' && 'code' in loadResult) {
            codeToTransform = loadResult.code as string;
          }
        }
        
        // Если не получили код из load, читаем с диска
        if (!codeToTransform && mod.file) {
          codeToTransform = await fs.readFile(mod.file, 'utf-8');
        }
        
        if (codeToTransform) {
          const transformResult = await server.pluginContainer.transform(codeToTransform, id);
          if (transformResult) {
            if (typeof transformResult === 'string') {
              transformed = transformResult;
            } else if (transformResult && typeof transformResult === 'object' && 'code' in transformResult) {
              transformed = transformResult.code as string;
            }
          }
        }
        
        if (!transformed) {
          transformed = codeToTransform || '// No transformation result';
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        transformed = `// Error transforming: ${error}`;
      }

      return {
        id: mod.id,
        file: mod.file,
        source,
        transformed
      };
    });

    // 7. Debug Resolve (Тестер алиасов)
    rpc.handle('vite:resolve', async (payload: unknown) => {
      try {
        const { id, importer } = payload as { id: string; importer?: string };
        // Вызываем внутренний резолвер Vite
        const result = await server.pluginContainer.resolveId(id, importer);
        return {
          id: result?.id || null,
          external: result?.external || false,
          error: null
        };
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return { id: null, external: false, error };
      }
    });

    // 8. Middlewares Stack
    rpc.handle('vite:middlewares', () => {
      if (!server?.middlewares) return [];
      // server.middlewares - это connect app
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stack = (server.middlewares as any).stack || [];
      return stack.map((m: any, i: number) => ({
        index: i,
        route: m.route || '/',
        // Пытаемся достать имя функции
        name: m.handle?.name || '(anonymous)',
      }));
    });

    // 9. Actions
    rpc.handle('vite:restart', async () => {
      if (server.restart) {
        await server.restart();
        return { success: true };
      }
      throw new Error('Server restart not available');
    });

    rpc.handle('vite:clearCache', async () => {
      if (config.cacheDir) {
        await fs.rm(config.cacheDir, { recursive: true, force: true });
        return config.cacheDir;
      }
      throw new Error('Cache dir not found');
    });

    // 10. Events Log
    rpc.handle('vite:events:list', (payload: unknown) => {
      const { limit = 100, type, since } = (payload || {}) as {
        limit?: number;
        type?: ViteEvent['type'];
        since?: number;
      };
      
      let filtered = events;
      
      if (type) {
        filtered = filtered.filter(e => e.type === type);
      }
      
      if (since) {
        filtered = filtered.filter(e => e.timestamp >= since);
      }
      
      return filtered.slice(0, limit || 100);
    });

    rpc.handle('vite:events:clear', () => {
      events.length = 0;
      return { cleared: true };
    });

    rpc.handle('vite:events:stats', () => {
      const stats = {
        total: events.length,
        byType: {} as Record<string, number>,
        oldest: events.length > 0 ? events[events.length - 1].timestamp : null,
        newest: events.length > 0 ? events[0].timestamp : null
      };
      
      events.forEach(e => {
        stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
      });
      
      return stats;
    });

    // Настройка сбора событий
    if (server.ws) {
      // HMR события
      server.ws.on('vite:hmr', (payload) => {
        if (payload && typeof payload === 'object' && 'updates' in payload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updates = (payload as any).updates || [];
          updates.forEach((update: any) => {
            addEvent('hmr', {
              file: update.path || update.file || '',
              type: update.type || 'update',
              acceptedPath: update.acceptedPath,
              timestamp: update.timestamp || Date.now()
            });
          });
        }
      });

      // WebSocket подключения
      server.ws.on('connection', () => {
        addEvent('connection', {
          action: 'connected',
          timestamp: Date.now()
        });
      });

      // Ошибки WebSocket
      server.ws.on('error', (error) => {
        addEvent('error', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      });
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : '';
    console.error('[Vite Inspector] Error registering RPC methods:', error);
    console.error('[Vite Inspector] Stack:', stack);
    throw e;
  }
}
