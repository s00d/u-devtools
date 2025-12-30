import type { PluginOption, ViteDevServer } from 'vite';
import { ViteRpcServer } from '@u-devtools/bridge';
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Используем createRequire для надежного резолвинга в монорепо и node_modules
const require = createRequire(import.meta.url);

// Идентификаторы
const VIRTUAL_MODULE_ID = 'virtual:u-devtools-plugins';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const VIRTUAL_APP_ID = 'virtual:u-devtools-app';
const RESOLVED_APP_ID = `\0${VIRTUAL_APP_ID}`;

export interface DevToolsOptions {
  base?: string;
  plugins?: DevToolsPlugin[];
  /**
   * Enable or disable DevTools.
   * @default true
   */
  enabled?: boolean;
}

export function createDevTools(options: DevToolsOptions = {}): PluginOption | PluginOption[] {
  const { base = '/__devtools', plugins = [], enabled = true } = options;

  // --- ЛОГИКА ОТКЛЮЧЕНИЯ ---
  if (!enabled) {
    return {
      name: 'u-devtools',
      apply: 'serve',
      // Возвращаем пустой плагин, чтобы Vite не ругался, но ничего не происходило
    };
  }

  // --- 1. ОПРЕДЕЛЕНИЕ ПУТЕЙ (CLIENT & OVERLAY) ---

  const isRunningFromSrc = import.meta.url.endsWith('.ts');

  let clientEntryPath: string;
  let overlayEntryPath: string;

  if (isRunningFromSrc) {
    // --- DEV MODE (Monorepo) ---
    // Используем относительные пути к исходникам
    const localClientPath = path.resolve(__dirname, '../../client');
    clientEntryPath = path.join(localClientPath, 'src/main.ts');

    // Резолвим оверлей (src)
    const localOverlayPath = path.resolve(__dirname, '../../overlay');
    overlayEntryPath = path.join(localOverlayPath, 'src/main.ts');
  } else {
    // --- PROD MODE (User) ---
    // Ищем через require.resolve в node_modules
    try {
      // 1. Client
      const clientPkgPath = require.resolve('@u-devtools/client/package.json');
      const clientRoot = path.dirname(clientPkgPath);
      const clientPkg = require(clientPkgPath);
      clientEntryPath = path.resolve(
        clientRoot,
        clientPkg.publishConfig?.main || 'dist/main.js'
      );

      // 2. Overlay
      const overlayPkgPath = require.resolve('@u-devtools/overlay/package.json');
      const overlayRoot = path.dirname(overlayPkgPath);
      const overlayPkg = require(overlayPkgPath);
      // Используем исходные файлы (src/main.ts) вместо собранных для поддержки HMR
      const overlaySrcPath = path.resolve(overlayRoot, 'src/main.ts');
      const overlayDistPath = path.resolve(
        overlayRoot,
        overlayPkg.publishConfig?.main || 'dist/index.js'
      );
      overlayEntryPath = fs.existsSync(overlaySrcPath) ? overlaySrcPath : overlayDistPath;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(
        `[u-devtools] Failed to resolve dependencies.\n` +
          `Ensure you have installed: @u-devtools/client and @u-devtools/overlay\n` +
          `Error: ${errorMessage}`
      );
    }
  }

  // Собираем все Vite плагины из плагинов DevTools
  const vitePluginsFromDevTools: PluginOption[] = [];
  plugins.forEach((p) => {
    if (p.vitePlugins) {
      p.vitePlugins.forEach((getPlugin) => {
        const plugin = getPlugin();
        if (Array.isArray(plugin)) {
          vitePluginsFromDevTools.push(...plugin);
        } else if (plugin) {
          vitePluginsFromDevTools.push(plugin);
        }
      });
    }
  });

  const mainPlugin: PluginOption = {
    name: 'u-devtools',
    apply: 'serve',

    config() {
      return {
        optimizeDeps: {
          // ВАЖНО: Исключаем пакеты из пре-бандлинга.
          // Vite будет обрабатывать файлы внутри node_modules как исходный код:
          // 1. Сохранится import.meta.hot (HMR заработает).
          // 2. CSS импорты будут разрешаться корректно (стили починятся).
          exclude: ['@u-devtools/client', '@u-devtools/overlay'],
        },
        // Для надежности явно разрешаем доступ к FS
        server: {
          fs: {
            allow: ['node_modules/@u-devtools'],
          },
        },
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
      if (id === VIRTUAL_APP_ID) return RESOLVED_APP_ID;
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const clientPlugins = plugins.filter((p) => p.clientPath);
        if (clientPlugins.length === 0) return 'export const plugins = []';
        // Добавляем .replace(/\\/g, '/') для совместимости с Windows
        const imports = clientPlugins
          .map((p, i) => `import plugin${i} from '${p.clientPath?.replace(/\\/g, '/') ?? ''}'`)
          .join('\n');
        const exports = `export const plugins = [${clientPlugins.map((_, i) => `plugin${i}`).join(', ')}]`;
        return `${imports}\n${exports}`;
      }

      if (id === RESOLVED_APP_ID) {
        const appPlugins = plugins.filter((p) => p.appPath);
        if (appPlugins.length === 0) return '';
        // Добавляем .replace(/\\/g, '/') для совместимости с Windows
        return appPlugins
          .map((p) => `import '${p.appPath?.replace(/\\/g, '/') ?? ''}';`)
          .join('\n');
      }
      return null;
    },

    configureServer(server: ViteDevServer) {
      // Set Vite server context for @vue/devtools-kit if available
      try {
        const { setViteServerContext } = require('@vue/devtools-kit');
        setViteServerContext(server);
      } catch (_e) {
        // @vue/devtools-kit might not be available, ignore
      }

      const rpcServer = new ViteRpcServer(server.ws);
      const ctx = { root: server.config.root, server };

      plugins.forEach((p) => {
        if (p.setupServer) {
          try {
            p.setupServer(rpcServer, ctx);
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.error(`[u-devtools] Error setting up plugin ${p.name}:`, error);
          }
        }
      });

      rpcServer.handle('sys:getPlugins', () => plugins.map((p) => ({ name: p.name })));
      rpcServer.handle('sys:openFile', async (payload: unknown) => {
        const {
          file,
          line = 1,
          column = 1,
          editor = 'code',
        } = payload as {
          file: string;
          line?: number;
          column?: number;
          editor?: string;
        };
        const filePath = path.resolve(ctx.root, file);
        const open = (await import('launch-editor')).default;
        // launch-editor использует переменную окружения LAUNCH_EDITOR для выбора редактора
        // Временно устанавливаем её, если не задана
        const originalEditor = process.env.LAUNCH_EDITOR;
        if (!originalEditor && editor) {
          process.env.LAUNCH_EDITOR = editor;
        }
        try {
          open(filePath, `:${line}:${column}`);
        } finally {
          // Восстанавливаем оригинальное значение, если мы его меняли
          if (!originalEditor && editor) {
            delete process.env.LAUNCH_EDITOR;
          }
        }
      });

      // --- PLUGIN MANAGER CORE LOGIC ---

      // 1. Получение списка плагинов
      rpcServer.handle('sys:plugins:list', () => {
        return plugins.map((p) => ({
          name: p.name,
          // Если метаданных нет, пытаемся угадать, является ли плагин встроенным
          isCore:
            p.name.startsWith('I18n') ||
            p.name.startsWith('Network') ||
            p.name.startsWith('Inspector') ||
            p.name.startsWith('Vite') ||
            p.name.startsWith('Terminal') ||
            !p.meta,
          meta: p.meta || {
            name: 'unknown',
            version: '0.0.0',
            description: 'No description provided',
          },
        }));
      });

      // --- PLUGIN MANAGER: MARKETPLACE ---

      // Хелпер для выполнения команд
      const runCommand = async (cmd: string, cwd: string) => {
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);
        return execAsync(cmd, { cwd, maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
      };

      // Хелпер для определения текущего пакетного менеджера проекта
      const getPackageManager = () => {
        const userAgent = process.env.npm_config_user_agent;
        if (userAgent?.startsWith('pnpm')) return 'pnpm';
        if (userAgent?.startsWith('yarn')) return 'yarn';
        if (userAgent?.startsWith('bun')) return 'bun';
        return 'npm';
      };

      // 1. Поиск плагинов в NPM (через npm search)
      rpcServer.handle('sys:plugins:search', async (payload: unknown) => {
        const query = payload as string;
        const text = query || 'keywords:u-devtools-plugin';

        try {
          // Используем 'npm search' с флагом --json.
          // npm обычно установлен даже если используется pnpm/yarn.
          // Это надежнее для парсинга, чем вывод pnpm/yarn search.
          const { stdout } = await runCommand(`npm search ${text} --json`, ctx.root);

          const data = JSON.parse(stdout);

          // Приводим формат npm search к нужному нам интерфейсу
          return Array.isArray(data)
            ? data.map(
                (pkg: {
                  name: string;
                  version: string;
                  description?: string;
                  maintainers?: Array<{ username: string }>;
                  author?: { name: string };
                  links?: { npm?: string };
                }) => ({
                  name: pkg.name,
                  version: pkg.version,
                  description: pkg.description || 'No description',
                  author: pkg.maintainers?.[0]?.username || pkg.author?.name || 'Unknown',
                  homepage: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
                })
              )
            : [];
        } catch (e) {
          console.warn('[u-devtools] npm search failed:', e);
          return [];
        }
      });

      // 2. Установка плагина
      rpcServer.handle('sys:plugins:install', async (payload: unknown) => {
        const pkgName = payload as string;
        // Динамический импорт для избежания проблем с ESM
        const { loadFile, writeFile, builders } = await import('magicast');

        // Хелпер для преобразования имени пакета в имя переменной
        const packageToImportName = (pkgName: string): string => {
          const name = pkgName.split('/').pop()?.replace('plugin-', '') || '';
          return `${name.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Plugin`;
        };

        const pm = getPackageManager();
        // Формируем команду установки для конкретного менеджера
        const cmd =
          pm === 'npm'
            ? `npm install -D ${pkgName}`
            : pm === 'yarn'
              ? `yarn add -D ${pkgName}`
              : `${pm} add -D ${pkgName}`;

        try {
          // 1. Установка пакета через CLI
          await runCommand(cmd, ctx.root);

          // 2. Модификация vite.config.ts
          const configPath = path.resolve(ctx.root, 'vite.config.ts');
          if (fs.existsSync(configPath)) {
            try {
              const mod = await loadFile(configPath);
              const importName = packageToImportName(pkgName);

              // Добавляем импорт
              mod.imports.$add({
                from: pkgName,
                imported: importName,
              });

              // Добавляем в массив plugins
              const configObj =
                mod.exports.default.$type === 'function-call'
                  ? mod.exports.default.$args[0]
                  : mod.exports.default;

              if (configObj?.plugins) {
                const pluginsArray = configObj.plugins;
                if (Array.isArray(pluginsArray)) {
                  pluginsArray.push(builders.functionCall(importName, []));
                } else if (pluginsArray.$type === 'array') {
                  pluginsArray.push(builders.functionCall(importName, []));
                }
              } else {
                console.warn(
                  `[u-devtools] Could not auto-inject plugin "${pkgName}" into vite.config.ts. Please add it manually.`
                );
              }

              await writeFile(mod, configPath);
            } catch (configError: unknown) {
              const message =
                configError instanceof Error ? configError.message : String(configError);
              console.warn(
                `[u-devtools] Failed to modify vite.config.ts: ${message}. Plugin installed, but you may need to add it manually.`
              );
            }
          }

          return { success: true };
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          return { success: false, error: message };
        }
      });

      // 3. Удаление плагина
      rpcServer.handle('sys:plugins:uninstall', async (payload: unknown) => {
        const pkgName = payload as string;
        const pm = getPackageManager();
        const cmd =
          pm === 'npm'
            ? `npm uninstall ${pkgName}`
            : pm === 'yarn'
              ? `yarn remove ${pkgName}`
              : `${pm} remove ${pkgName}`;

        try {
          // Удаление пакета
          await runCommand(cmd, ctx.root);

          // Примечание: Автоматическое удаление из vite.config.ts через magicast сложно,
          // так как нужно найти и удалить конкретный вызов функции из массива.
          // Для MVP просто удаляем пакет, а пользователь может почистить конфиг вручную.

          return { success: true };
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          return { success: false, error: message };
        }
      });

      // 4. Проверка обновлений (через npm view)
      rpcServer.handle('sys:plugins:checkUpdates', async (payload: unknown) => {
        const packages = payload as string[];
        const updates: Record<string, string> = {};

        // Запускаем проверки параллельно
        await Promise.all(
          packages.map(async (pkgName) => {
            if (!pkgName || pkgName === 'unknown') return;
            try {
              // 'npm view <pkg> version' возвращает последнюю версию строкой
              const { stdout } = await runCommand(`npm view ${pkgName} version`, ctx.root);
              const latestVersion = stdout.trim();
              if (latestVersion) {
                updates[pkgName] = latestVersion;
              }
            } catch (e) {
              // Пакет не найден или ошибка сети
            }
          })
        );

        return updates;
      });

      // 3. Эндпоинт для чтения HttpOnly кук
      server.middlewares.use('/__u-devtools/cookies', (req, res) => {
        const cookieHeader = req.headers.cookie || '';
        const cookies = cookieHeader
          .split(';')
          .filter(Boolean)
          .map((str) => {
            const [key, ...v] = str.split('=');
            return {
              key: key?.trim() || '',
              value: decodeURIComponent(v.join('=')),
              httpOnly: true, // Помечаем как серверные
            };
          })
          .filter((c) => c.key);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(cookies));
      });

      // 4. Обслуживание Shell (оболочки)
      server.middlewares.use(`${base}/index.html`, (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        // Используем вычисленный путь clientEntryPath
        const normalizedPath = clientEntryPath.replace(/\\/g, '/');
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Universal DevTools</title>
              <style>
                #udt-loader {
                  position: fixed;
                  inset: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #0f172a;
                  z-index: 2147483646 !important;
                  transition: opacity 0.3s ease;
                }
                #udt-loader.hidden {
                  opacity: 0;
                  pointer-events: none;
                }
                .udt-spinner {
                  width: 48px;
                  height: 48px;
                  border: 4px solid rgba(99, 102, 241, 0.2);
                  border-top-color: #6366f1;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div id="udt-loader">
                <div class="udt-spinner"></div>
              </div>
              <div id="app"></div>
              <script type="module" src="/@fs/${normalizedPath}"></script>
            </body>
          </html>
        `);
      });
    },

    transformIndexHtml(html) {
      const appPlugins = plugins.filter((p) => p.appPath);

      // Инъекция скриптов плагинов (Inspector, Network...)
      const appScript =
        appPlugins.length > 0
          ? `<script type="module">import "/@id/${VIRTUAL_APP_ID}";</script>`
          : '';

      // Нормализуем путь оверлея для Windows
      const normalizedOverlayPath = overlayEntryPath.replace(/\\/g, '/');

      // Инъекция Оверлея (Кнопка + Контейнер)
      // ВАЖНО: Передаем конфигурацию (BASE URL) через глобальную переменную,
      // так как <script type="module"> не имеет document.currentScript
      const loaderScript = `
        <script>
          window.__UDEVTOOLS_CONFIG__ = {
            base: '${base}'
          };
        </script>
        <script type="module" src="/@fs/${normalizedOverlayPath}"></script>
      `;

      return `${html}${appScript}${loaderScript}`;
    },
  };

  // Если есть дополнительные Vite плагины, возвращаем массив
  if (vitePluginsFromDevTools.length > 0) {
    return [mainPlugin, ...vitePluginsFromDevTools];
  }

  return mainPlugin;
}
