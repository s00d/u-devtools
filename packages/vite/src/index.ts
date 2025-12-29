import type { PluginOption, ViteDevServer } from 'vite';
import { ViteRpcServer } from '@u-devtools/bridge';
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

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
  const { 
    base = '/__devtools', 
    plugins = [], 
    enabled = true
  } = options;

  // --- ЛОГИКА ОТКЛЮЧЕНИЯ ---
  if (!enabled) {
    return {
      name: 'u-devtools',
      apply: 'serve',
      // Возвращаем пустой плагин, чтобы Vite не ругался, но ничего не происходило
    };
  }

  // --- СУПЕР ПРОСТОЙ ПОИСК ---
  // Используем стандартный механизм Node.js резолвинга через package.json
  // В dev-режиме (workspace) package.json.main указывает на src/main.ts
  // В prod-режиме (npm) publishConfig.main указывает на dist/main.js
  let clientEntryPath: string;

  try {
    // 1. Спрашиваем Node.js, где лежит package.json клиента
    const clientPkgPath = require.resolve('@u-devtools/client/package.json');
    const clientRoot = path.dirname(clientPkgPath);

    // 2. Читаем package.json, чтобы узнать entry point ("main")
    // В dev-режиме это будет "./src/main.ts", в prod (из npm) - "./dist/main.js"
    const clientPkg = require(clientPkgPath);

    // 3. Собираем полный путь
    clientEntryPath = path.resolve(clientRoot, clientPkg.main);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`[@u-devtools/vite] Failed to resolve client: ${errorMessage}`);
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
      // Vite автоматически резолвит через package.json, алиасы не нужны
      return {};
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
        const imports = clientPlugins.map((p, i) => `import plugin${i} from '${p.clientPath!.replace(/\\/g, '/')}'`).join('\n');
        const exports = `export const plugins = [${clientPlugins.map((_, i) => `plugin${i}`).join(', ')}]`;
        return `${imports}\n${exports}`;
      }

      if (id === RESOLVED_APP_ID) {
        const appPlugins = plugins.filter((p) => p.appPath);
        if (appPlugins.length === 0) return '';
        // Добавляем .replace(/\\/g, '/') для совместимости с Windows
        return appPlugins.map((p) => `import '${p.appPath!.replace(/\\/g, '/')}';`).join('\n');
      }
      return null;
    },

    configureServer(server: ViteDevServer) {
      // Set Vite server context for @vue/devtools-kit if available
      try {
        const { setViteServerContext } = require('@vue/devtools-kit');
        setViteServerContext(server);
      } catch (e) {
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
        const { file, line = 1, column = 1, editor = 'code' } = payload as { 
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
          isCore: p.name.startsWith('I18n') || p.name.startsWith('Network') || p.name.startsWith('Inspector') || p.name.startsWith('Vite') || p.name.startsWith('Terminal') || !p.meta,
          meta: p.meta || {
            name: 'unknown',
            version: '0.0.0',
            description: 'No description provided',
          },
        }));
      });

      // --- PLUGIN MANAGER: MARKETPLACE ---

      // 1. Поиск плагинов в NPM (Marketplace)
      rpcServer.handle('sys:plugins:search', async (payload: unknown) => {
        const query = payload as string;
        const text = query || 'keywords:u-devtools-plugin';
        return new Promise((resolve) => {
          https.get(
            `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=20`,
            { headers: { 'User-Agent': 'u-devtools' } },
            (res) => {
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                try {
                  const json = JSON.parse(data);
                  const results = json.objects.map((obj: { package: { name: string; version: string; description?: string; publisher?: { username: string }; links?: { npm?: string } } }) => ({
                    name: obj.package.name,
                    version: obj.package.version,
                    description: obj.package.description || 'No description',
                    author: obj.package.publisher?.username || 'Unknown',
                    homepage: obj.package.links?.npm || `https://www.npmjs.com/package/${obj.package.name}`,
                  }));
                  resolve(results);
                } catch {
                  resolve([]);
                }
              });
            }
          ).on('error', () => resolve([]));
        });
      });

      // 2. Установка плагина
      rpcServer.handle('sys:plugins:install', async (payload: unknown) => {
        const pkgName = payload as string;
        // Динамический импорт для избежания проблем с ESM
        const { loadFile, writeFile, builders } = await import('magicast');
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);

        // Хелпер для определения пакетного менеджера
        const getPackageManager = () => {
          const userAgent = process.env.npm_config_user_agent;
          if (userAgent?.startsWith('pnpm')) return 'pnpm';
          if (userAgent?.startsWith('yarn')) return 'yarn';
          return 'npm';
        };

        // Хелпер для преобразования имени пакета в имя переменной
        const packageToImportName = (pkgName: string): string => {
          const name = pkgName.split('/').pop()?.replace('plugin-', '') || '';
          return name.replace(/-(\w)/g, (_, c) => c.toUpperCase()) + 'Plugin';
        };

        const pm = getPackageManager();
        const cmd = pm === 'npm' ? `npm install -D ${pkgName}` : `${pm} add -D ${pkgName}`;

        try {
          // 1. Установка пакета
          await execAsync(cmd, { cwd: ctx.root });

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
              const message = configError instanceof Error ? configError.message : String(configError);
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
        const { exec } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const execAsync = promisify(exec);

        // Хелпер для определения пакетного менеджера
        const getPackageManager = () => {
          const userAgent = process.env.npm_config_user_agent;
          if (userAgent?.startsWith('pnpm')) return 'pnpm';
          if (userAgent?.startsWith('yarn')) return 'yarn';
          return 'npm';
        };

        const pm = getPackageManager();
        const cmd = pm === 'npm' ? `npm uninstall ${pkgName}` : `${pm} remove ${pkgName}`;

        try {
          // Удаление пакета
          await execAsync(cmd, { cwd: ctx.root });

          // Примечание: Автоматическое удаление из vite.config.ts через magicast сложно,
          // так как нужно найти и удалить конкретный вызов функции из массива.
          // Для MVP просто удаляем пакет, а пользователь может почистить конфиг вручную.

          return { success: true };
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          return { success: false, error: message };
        }
      });

      // 4. Проверка обновлений (NPM Registry)
      rpcServer.handle('sys:plugins:checkUpdates', async (payload: unknown) => {
        const packages = payload as string[];
        const updates: Record<string, string> = {};

        await Promise.all(
          packages.map(
            (pkgName) =>
              new Promise<void>((resolve) => {
                if (!pkgName || pkgName === 'unknown') {
                  resolve();
                  return;
                }

                const req = https.get(
                  `https://registry.npmjs.org/${pkgName}/latest`,
                  { headers: { 'User-Agent': 'u-devtools' } },
                  (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                      data += chunk;
                    });
                    res.on('end', () => {
                      try {
                        if (res.statusCode === 200) {
                          const info = JSON.parse(data);
                          updates[pkgName] = info.version;
                        }
                      } catch {
                        // ignore parse errors
                      }
                      resolve();
                    });
                  }
                );

                req.on('error', () => resolve());
                req.end();
              })
          )
        );

        return updates;
      });

      // 3. Эндпоинт для чтения HttpOnly кук
      server.middlewares.use('/__u-devtools/cookies', (req, res) => {
        const cookieHeader = req.headers.cookie || '';
        const cookies = cookieHeader.split(';').filter(Boolean).map((str) => {
          const [key, ...v] = str.split('=');
          return {
            key: key?.trim() || '',
            value: decodeURIComponent(v.join('=')),
            httpOnly: true // Помечаем как серверные
          };
        }).filter(c => c.key);

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
      // ИСПРАВЛЕНИЕ: Используем /@id/ для явного указания Vite, что это модуль
      // Это обходит проверки CORS браузера, так как для него это просто путь от корня
      const appScript = appPlugins.length > 0 
        ? `<script type="module">import "/@id/${VIRTUAL_APP_ID}";</script>` 
        : '';

      const loaderScript = `
        <script>
          (function() {
            if (document.getElementById('udt-container')) return;

            const STATE_KEY = 'u-devtools-state';
            const MIN_HEIGHT = 150;
            const MAX_HEIGHT_RATIO = 0.9;
            const clampHeight = (height) => {
              const maxHeight = Math.floor(window.innerHeight * MAX_HEIGHT_RATIO);
              return Math.max(MIN_HEIGHT, Math.min(maxHeight, height));
            };
            const loadState = () => {
              try {
                const saved = JSON.parse(localStorage.getItem(STATE_KEY)) || { height: 400, isOpen: false };
                saved.height = clampHeight(saved.height);
                return saved;
              }
              catch { return { height: clampHeight(400), isOpen: false }; }
            };
            const saveState = (state) => localStorage.setItem(STATE_KEY, JSON.stringify(state));

            const state = loadState();
            
            // --- 1. Контейнер Iframe ---
            const iframeContainer = document.createElement('div');
            iframeContainer.id = 'udt-container';
            
            // Блокировка скролла страницы при наведении на DevTools
            let originalOverflow = '';
            let originalOverflowY = '';
            let isHovering = false;
            
            const blockPageScroll = () => {
              if (isHovering) return;
              isHovering = true;
              originalOverflow = document.body.style.overflow;
              originalOverflowY = document.body.style.overflowY;
              document.body.style.overflow = 'hidden';
              document.body.style.overflowY = 'hidden';
            };
            
            const unblockPageScroll = () => {
              if (!isHovering) return;
              isHovering = false;
              document.body.style.overflow = originalOverflow;
              document.body.style.overflowY = originalOverflowY;
            };
            
            // Блокируем скролл при наведении на контейнер
            iframeContainer.addEventListener('mouseenter', blockPageScroll);
            iframeContainer.addEventListener('mouseleave', unblockPageScroll);
            
            iframeContainer.style.cssText = \`
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              height: \${state.height}px;
              z-index: 2147483647 !important;
              display: \${state.isOpen ? 'block' : 'none'};
              background: transparent;
              box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
              isolation: isolate;
            \`;

            // --- 2. Ручка ресайза (Resizer) ---
            const resizer = document.createElement('div');
            resizer.style.cssText = 'position: absolute; top: -5px; left: 0; width: 100%; height: 10px; cursor: row-resize; z-index: 2147483647 !important; background: transparent;';
            
            // Визуальная полоска
            const resizerLine = document.createElement('div');
            resizerLine.style.cssText = 'width: 100%; height: 1px; background: rgba(0,0,0,0.1); margin-top: 4px; transition: background 0.2s, height 0.2s;';
            resizer.appendChild(resizerLine);
            
            let isResizing = false;
            resizer.onmouseenter = () => { 
              if (!isResizing) {
                resizerLine.style.background = '#6366f1'; 
                resizerLine.style.height = '2px'; 
              }
            };
            resizer.onmouseleave = () => { 
              if (!isResizing) { 
                resizerLine.style.background = 'rgba(0,0,0,0.1)'; 
                resizerLine.style.height = '1px'; 
              } 
            };

            const iframe = document.createElement('iframe');
            iframe.src = '${base}/index.html';
            iframe.style.cssText = 'width: 100%; height: 100%; border: none; background: white;';
            // Поддержка темной темы для фона iframe до загрузки контента
            if (localStorage.getItem('u-devtools-theme') === 'dark') {
               iframe.style.background = '#0f172a';
            }
            
            // Блокируем скролл при наведении на iframe
            iframe.addEventListener('mouseenter', blockPageScroll);
            iframe.addEventListener('mouseleave', unblockPageScroll);

            iframeContainer.appendChild(resizer);
            iframeContainer.appendChild(iframe);
            document.body.appendChild(iframeContainer);

            // --- Функция обновления отступа body ---
            const updateBodyPadding = () => {
              if (state.isOpen) {
                document.body.style.paddingBottom = iframeContainer.style.height;
              } else {
                document.body.style.paddingBottom = '0';
              }
            };

            // --- 3. Логика Ресайза ---
            let startY = 0;
            let startHeight = 0;
            let currentPointerId = null;
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; z-index: 2147483646 !important; display: none; cursor: row-resize; pointer-events: auto;';
            document.body.appendChild(overlay);

            const handlePointerMove = (e) => {
              if (!isResizing || currentPointerId !== e.pointerId) return;
              e.preventDefault();
              e.stopPropagation();
              const delta = startY - e.clientY;
              const newHeight = clampHeight(startHeight + delta);
              iframeContainer.style.height = newHeight + 'px';
              updateBodyPadding();
            };

            const handlePointerUp = (e) => {
              if (!isResizing || currentPointerId !== e.pointerId) return;
              e.preventDefault();
              e.stopPropagation();
              isResizing = false;
              currentPointerId = null;
              overlay.style.display = 'none';
              document.body.style.userSelect = '';
              resizerLine.style.background = 'rgba(0,0,0,0.1)';
              resizerLine.style.height = '1px';
              const finalHeight = clampHeight(parseInt(iframeContainer.style.height, 10));
              iframeContainer.style.height = finalHeight + 'px';
              state.height = finalHeight;
              updateBodyPadding();
              saveState(state);
              if (resizer.hasPointerCapture && resizer.hasPointerCapture(e.pointerId)) {
                resizer.releasePointerCapture(e.pointerId);
              }
              window.removeEventListener('pointermove', handlePointerMove, true);
              window.removeEventListener('pointerup', handlePointerUp, true);
              window.removeEventListener('pointercancel', handlePointerUp, true);
            };

            resizer.onpointerdown = (e) => {
              e.preventDefault();
              e.stopPropagation();
              isResizing = true;
              currentPointerId = e.pointerId;
              startY = e.clientY;
              startHeight = parseInt(iframeContainer.style.height, 10);
              overlay.style.display = 'block';
              resizerLine.style.background = '#6366f1';
              resizerLine.style.height = '2px';
              document.body.style.userSelect = 'none';
              // Захватываем указатель для надежного отслеживания даже при быстром движении
              if (resizer.setPointerCapture) {
                resizer.setPointerCapture(e.pointerId);
              }
              // Используем window с capture phase для глобального отслеживания
              window.addEventListener('pointermove', handlePointerMove, true);
              window.addEventListener('pointerup', handlePointerUp, true);
              window.addEventListener('pointercancel', handlePointerUp, true);
            };

            // --- 4. Плавающая кнопка (Launcher) ---
            const btnContainer = document.createElement('div');
            btnContainer.style.cssText = \`
              position: fixed; bottom: 20px; left: 0; z-index: 2147483646 !important;
              transition: transform 0.3s ease, opacity 0.3s;
              transform: translateX(\${state.isOpen ? '-100%' : 'calc(-100% + 8px)'});
              opacity: \${state.isOpen ? '0' : '0.6'};
            \`;

            const btn = document.createElement('div');
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
            btn.style.cssText = 'background: #18181b; color: white; padding: 10px 14px 10px 12px; border-radius: 0 8px 8px 0; cursor: pointer; display: flex; align-items: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.2);';
            
            btnContainer.appendChild(btn);
            document.body.appendChild(btnContainer);

            // --- Launcher Menu ---
            let menuItems = [];
            let isMenuOpen = false;
            const menuContainer = document.createElement('div');
            menuContainer.id = 'udt-launcher-menu';
            menuContainer.style.cssText = \`
              position: fixed;
              bottom: 80px;
              left: 0;
              z-index: 2147483646 !important;
              background: #27272a;
              border: 1px solid #3f3f46;
              border-radius: 8px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.4);
              min-width: 200px;
              max-width: 300px;
              max-height: 400px;
              overflow-y: auto;
              display: none;
              opacity: 0;
              transform: translateY(10px);
              transition: opacity 0.2s ease, transform 0.2s ease;
            \`;
            document.body.appendChild(menuContainer);

            // Функция для получения SVG иконки (упрощенная версия для популярных иконок)
            const getIconSVG = (iconName) => {
              const icons = {
                'Bolt': '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />',
                'Cog': '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
                'Cube': '<path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />',
                'CommandLine': '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m3 0h3.75M6.75 21H12a10.5 10.5 0 001.875-20.879A10.5 10.5 0 0012 3H6.75z" />',
                'MagnifyingGlass': '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />',
                'XMark': '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />',
                'InformationCircle': '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />',
                'Squares2X2': '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />',
                'AdjustmentsHorizontal': '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0h2.25m-2.25 0a1.5 1.5 0 10-3 0m3 0H3.75m0 0H2.25m9.75 9.75H21m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m3 0H3.75m0 0H2.25m9.75 0v9.75m0-9.75v-9.75m0 9.75H3.75m6 0v9.75m0-9.75v-9.75m0 9.75h9.75m0 0v9.75m0-9.75v-9.75m0 9.75H21" />',
              };
              const path = icons[iconName] || '<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />';
              return \`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">\${path}</svg>\`;
            };

            const renderMenu = () => {
              menuContainer.innerHTML = '';
              
              if (menuItems.length === 0) {
                menuContainer.style.display = 'none';
                return;
              }

              menuItems.forEach((pluginData) => {
                pluginData.items.forEach((item) => {
                  if (item.separator) {
                    const separator = document.createElement('div');
                    separator.style.cssText = 'height: 1px; background: #3f3f46; margin: 4px 8px;';
                    menuContainer.appendChild(separator);
                    return;
                  }

                  const menuItem = document.createElement('button');
                  menuItem.style.cssText = \`
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    text-align: left;
                    color: #e4e4e7;
                    font-size: 14px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: background 0.15s;
                  \`;
                  menuItem.onmouseenter = () => {
                    menuItem.style.background = '#3f3f46';
                  };
                  menuItem.onmouseleave = () => {
                    menuItem.style.background = 'transparent';
                  };
                  menuItem.onclick = async (e) => {
                    e.stopPropagation();
                    try {
                      await item.action();
                    } catch (err) {
                      console.error('[LauncherMenu] Action error:', err);
                    }
                    closeMenu();
                  };

                  const iconWrapper = document.createElement('div');
                  iconWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; flex-shrink: 0; color: #a1a1aa;';
                  iconWrapper.innerHTML = getIconSVG(item.icon);
                  menuItem.appendChild(iconWrapper);

                  const label = document.createElement('span');
                  label.textContent = item.label;
                  menuItem.appendChild(label);

                  menuContainer.appendChild(menuItem);
                });
              });
            };

            const showMenu = () => {
              if (menuItems.length === 0) {
                toggleDevTools();
                return;
              }
              isMenuOpen = true;
              renderMenu();
              menuContainer.style.display = 'block';
              requestAnimationFrame(() => {
                menuContainer.style.opacity = '1';
                menuContainer.style.transform = 'translateY(0)';
              });
            };

            const closeMenu = () => {
              isMenuOpen = false;
              menuContainer.style.opacity = '0';
              menuContainer.style.transform = 'translateY(10px)';
              setTimeout(() => {
                menuContainer.style.display = 'none';
              }, 200);
            };

            // Слушаем BroadcastChannel для получения пунктов меню
            const menuChannel = new BroadcastChannel('u-devtools:launcher-menu');
            menuChannel.onmessage = (e) => {
              const { event, data } = e.data;
              if (event === 'update-menu-items') {
                menuItems = data || [];
                if (isMenuOpen) {
                  renderMenu();
                }
              }
            };

            // Закрываем меню при клике снаружи
            document.addEventListener('click', (e) => {
              const target = e.target;
              if (isMenuOpen && target && !menuContainer.contains(target) && !btnContainer.contains(target)) {
                closeMenu();
              }
            });

            // Логика наведения
            btnContainer.onmouseenter = () => {
              if (!state.isOpen) {
                btnContainer.style.transform = 'translateX(0)';
                btnContainer.style.opacity = '1';
              }
            };
            btnContainer.onmouseleave = () => {
              if (!state.isOpen && !isMenuOpen) {
                btnContainer.style.transform = 'translateX(calc(-100% + 8px))';
                btnContainer.style.opacity = '0.6';
              }
            };

            // Логика клика
            const toggleDevTools = () => {
              state.isOpen = !state.isOpen;
              iframeContainer.style.display = state.isOpen ? 'block' : 'none';
              
              if (state.isOpen) {
                btnContainer.style.transform = 'translateX(-100%)';
                btnContainer.style.opacity = '0';
                btnContainer.style.pointerEvents = 'none';
                closeMenu();
              } else {
                btnContainer.style.transform = 'translateX(calc(-100% + 8px))';
                btnContainer.style.opacity = '0.6';
                btnContainer.style.pointerEvents = 'auto';
              }
              updateBodyPadding();
              saveState(state);
            };

            btn.onclick = (e) => {
              e.stopPropagation();
              if (isMenuOpen) {
                closeMenu();
              } else {
                showMenu();
              }
            };

            // --- 5. Слушаем команды закрытия изнутри Iframe ---
            window.addEventListener('message', (e) => {
              if (e.data === 'u-devtools:close') {
                state.isOpen = false;
                iframeContainer.style.display = 'none';
                btnContainer.style.transform = 'translateX(calc(-100% + 8px))';
                btnContainer.style.opacity = '0.6';
                btnContainer.style.pointerEvents = 'auto';
                updateBodyPadding();
                saveState(state);
              }
            });

            // --- 6. Инициализация отступа при загрузке ---
            if (state.isOpen) {
              const clampedHeight = clampHeight(state.height);
              if (clampedHeight !== state.height) {
                iframeContainer.style.height = clampedHeight + 'px';
                state.height = clampedHeight;
                saveState(state);
              }
              updateBodyPadding();
            }

            // --- 7. Обработка ресайза окна ---
            window.addEventListener('resize', () => {
              if (state.isOpen) {
                const currentHeight = parseInt(iframeContainer.style.height, 10);
                const clampedHeight = clampHeight(currentHeight);
                if (clampedHeight !== currentHeight) {
                  iframeContainer.style.height = clampedHeight + 'px';
                  state.height = clampedHeight;
                  saveState(state);
                }
                updateBodyPadding();
              }
            });

          })();
        </script>
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
