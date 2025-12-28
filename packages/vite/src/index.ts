import type { PluginOption, ViteDevServer } from 'vite';
import { ViteRpcServer } from '@u-devtools/bridge';
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { createRequire } from 'node:module';

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

  // Пытаемся найти путь к клиенту
  let CLIENT_ROOT = '';
  try {
    const clientPkgPath = require.resolve('@u-devtools/client/package.json');
    CLIENT_ROOT = path.dirname(clientPkgPath);
  } catch {
    // Fallback для разработки внутри монорепозитория
    CLIENT_ROOT = path.resolve(path.dirname(require.resolve('../../package.json')), 'packages/client');
  }

  return {
    name: 'u-devtools',
    apply: 'serve',

    config() {
      return {
        resolve: {
          alias: {
            '@u-devtools/client': CLIENT_ROOT,
          },
        },
        server: {
          fs: {
            allow: [CLIENT_ROOT],
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

      // 3. Обслуживание Shell (оболочки)
      server.middlewares.use(`${base}/index.html`, (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
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
              <script type="module" src="/@fs/${path.join(CLIENT_ROOT, 'src/main.ts')}"></script>
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
