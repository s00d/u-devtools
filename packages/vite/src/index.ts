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

export function createDevTools(options: DevToolsOptions = {}): PluginOption {
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

  return {
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
        const imports = clientPlugins.map((p, i) => `import plugin${i} from '${p.clientPath}'`).join('\n');
        const exports = `export const plugins = [${clientPlugins.map((_, i) => `plugin${i}`).join(', ')}]`;
        return `${imports}\n${exports}`;
      }

      if (id === RESOLVED_APP_ID) {
        const appPlugins = plugins.filter((p) => p.appPath);
        if (appPlugins.length === 0) return '';
        return appPlugins.map((p) => `import '${p.appPath}';`).join('\n');
      }
      return null;
    },

    configureServer(server: ViteDevServer) {
      const rpcServer = new ViteRpcServer(server.ws);
      const ctx = { root: server.config.root, server };

      plugins.forEach((p) => {
        if (p.setupServer) p.setupServer(rpcServer, ctx);
      });

      rpcServer.handle('sys:getPlugins', () => plugins.map((p) => ({ name: p.name })));
      rpcServer.handle('sys:openFile', async (payload: unknown) => {
        const { file, line = 1, column = 1 } = payload as { file: string; line?: number; column?: number };
        const filePath = path.resolve(ctx.root, file);
        const open = (await import('launch-editor')).default;
        open(filePath, `:${line}:${column}`);
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

      // 3. Обслуживание Shell (оболочки)
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
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
              <div id="app"></div>
              <script type="module" src="/@fs/${normalizedPath}"></script>
            </body>
          </html>
        `);
      });
    },

    transformIndexHtml(html) {
      const appPlugins = plugins.filter((p) => p.appPath);
      const appScript = appPlugins.length > 0 ? `<script type="module" src="${VIRTUAL_APP_ID}"></script>` : '';

      const loaderScript = `
        <script>
          (function() {
            if (document.getElementById('udt-container')) return;

            const STATE_KEY = 'u-devtools-state';
            const loadState = () => {
              try { return JSON.parse(localStorage.getItem(STATE_KEY)) || { height: 400, isOpen: false }; }
              catch { return { height: 400, isOpen: false }; }
            };
            const saveState = (state) => localStorage.setItem(STATE_KEY, JSON.stringify(state));

            const state = loadState();
            
            // --- 1. Контейнер Iframe ---
            const iframeContainer = document.createElement('div');
            iframeContainer.id = 'udt-container';
            iframeContainer.style.cssText = \`
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              height: \${state.height}px;
              z-index: 2147483647;
              display: \${state.isOpen ? 'block' : 'none'};
              background: transparent;
              box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
            \`;

            // --- 2. Ручка ресайза (Resizer) ---
            const resizer = document.createElement('div');
            resizer.style.cssText = 'position: absolute; top: -5px; left: 0; width: 100%; height: 10px; cursor: row-resize; z-index: 2147483648; background: transparent;';
            
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
            const overlay = document.createElement('div'); // Перекрывает iframe во время ресайза
            overlay.style.cssText = 'position: fixed; inset: 0; z-index: 2147483649; display: none; cursor: row-resize;';
            document.body.appendChild(overlay);

            resizer.onmousedown = (e) => {
              isResizing = true;
              startY = e.clientY;
              startHeight = parseInt(iframeContainer.style.height, 10);
              overlay.style.display = 'block'; // Включаем перекрытие, чтобы мышь не падала в iframe
              resizerLine.style.background = '#6366f1';
              resizerLine.style.height = '2px';
              document.body.style.userSelect = 'none';
            };

            document.addEventListener('mousemove', (e) => {
              if (!isResizing) return;
              const delta = startY - e.clientY;
              const newHeight = Math.max(100, Math.min(window.innerHeight - 50, startHeight + delta));
              iframeContainer.style.height = newHeight + 'px';
              updateBodyPadding();
            });

            document.addEventListener('mouseup', () => {
              if (isResizing) {
                isResizing = false;
                overlay.style.display = 'none';
                document.body.style.userSelect = '';
                resizerLine.style.background = 'rgba(0,0,0,0.1)';
                resizerLine.style.height = '1px';
                state.height = parseInt(iframeContainer.style.height, 10);
                updateBodyPadding();
                saveState(state);
              }
            });

            // --- 4. Плавающая кнопка (Launcher) ---
            const btnContainer = document.createElement('div');
            btnContainer.style.cssText = \`
              position: fixed; bottom: 20px; right: 0; z-index: 2147483646;
              transition: transform 0.3s ease, opacity 0.3s;
              transform: translateX(\${state.isOpen ? '100%' : 'calc(100% - 8px)'});
              opacity: \${state.isOpen ? '0' : '0.6'};
            \`;

            const btn = document.createElement('div');
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
            btn.style.cssText = 'background: #18181b; color: white; padding: 10px 12px 10px 14px; border-radius: 8px 0 0 8px; cursor: pointer; display: flex; align-items: center; box-shadow: -2px 2px 10px rgba(0,0,0,0.2);';
            
            btnContainer.appendChild(btn);
            document.body.appendChild(btnContainer);

            // Логика наведения
            btnContainer.onmouseenter = () => {
              if (!state.isOpen) {
                btnContainer.style.transform = 'translateX(0)';
                btnContainer.style.opacity = '1';
              }
            };
            btnContainer.onmouseleave = () => {
              if (!state.isOpen) {
                btnContainer.style.transform = 'translateX(calc(100% - 8px))';
                btnContainer.style.opacity = '0.6';
              }
            };

            // Логика клика
            const toggleDevTools = () => {
              state.isOpen = !state.isOpen;
              iframeContainer.style.display = state.isOpen ? 'block' : 'none';
              
              if (state.isOpen) {
                btnContainer.style.transform = 'translateX(100%)'; // Прячем кнопку совсем
                btnContainer.style.opacity = '0';
              } else {
                btnContainer.style.transform = 'translateX(calc(100% - 8px))';
                btnContainer.style.opacity = '0.6';
              }
              updateBodyPadding();
              saveState(state);
            };

            btn.onclick = toggleDevTools;

            // --- 5. Слушаем команды закрытия изнутри Iframe ---
            window.addEventListener('message', (e) => {
              if (e.data === 'u-devtools:close') {
                toggleDevTools();
              }
            });

            // --- 6. Инициализация отступа при загрузке ---
            if (state.isOpen) {
              updateBodyPadding();
            }

            // --- 7. Обработка ресайза окна ---
            window.addEventListener('resize', () => {
              if (state.isOpen) {
                updateBodyPadding();
              }
            });

          })();
        </script>
      `;

      return `${html}${appScript}${loaderScript}`;
    },
  };
}
