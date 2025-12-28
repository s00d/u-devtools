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
}

export function createDevTools(options: DevToolsOptions = {}): PluginOption {
  const plugins = options.plugins || [];
  let rpcServer: ViteRpcServer;
  const base = options.base || '/__devtools';

  // Пытаемся найти путь к клиенту
  let CLIENT_ROOT = '';
  try {
    const clientPkgPath = require.resolve('@u-devtools/client/package.json');
    CLIENT_ROOT = path.dirname(clientPkgPath);
  } catch (e) {
    // Fallback для разработки внутри монорепозитория
    CLIENT_ROOT = path.resolve(path.dirname(require.resolve('../../package.json')), 'packages/client');
  }

  return {
    name: 'u-devtools',
    apply: 'serve',

    config(config) {
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
      rpcServer = new ViteRpcServer(server.ws);
      const ctx = { root: server.config.root, server };

      plugins.forEach((p) => {
        if (p.setupServer) p.setupServer(rpcServer, ctx);
      });

      rpcServer.handle('sys:getPlugins', () => plugins.map((p) => ({ name: p.name })));
      rpcServer.handle('sys:openFile', async (payload: any) => {
        const { file, line = 1, column = 1 } = payload;
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

      // Логика кнопки-слайдера
      const launcherScript = `
        <script>
          (function() {
            // Защита от дублей
            if (document.getElementById('udt-launcher')) return;

            // --- Контейнер кнопки ---
            const container = document.createElement('div');
            container.id = 'udt-launcher';
            // Позиционирование
            container.style.cssText = 'position:fixed; bottom:30px; right:0; z-index:99999; display:flex; align-items:center; transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s; transform: translateX(calc(100% - 12px)); opacity: 0.8;';
            
            // --- Сама кнопка ---
            const btn = document.createElement('button');
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
            btn.setAttribute('aria-label', 'Open DevTools');
            // Стили кнопки
            btn.style.cssText = 'background:#18181b; color:#fff; border:1px solid #333; border-right:none; border-radius: 8px 0 0 8px; cursor:pointer; padding:10px 12px 10px 16px; display:flex; align-items:center; gap:8px; box-shadow: -4px 4px 10px rgba(0,0,0,0.2); font-family: sans-serif; font-weight: 600; font-size: 14px; white-space: nowrap;';
            
            // Текст внутри кнопки (логотип)
            const label = document.createElement('span');
            label.innerText = 'DevTools';
            btn.appendChild(label);
            
            container.appendChild(btn);
            document.body.appendChild(container);

            // --- Логика поведения ---
            let hideTimeout;
            let isHovered = false;
            let isOpen = false;

            const show = () => {
              container.style.transform = 'translateX(0)';
              container.style.opacity = '1';
            };

            const hide = () => {
              if (isOpen || isHovered) return;
              // Скрываем, оставляя 12 пикселей торчать
              container.style.transform = 'translateX(calc(100% - 12px))';
              container.style.opacity = '0.6';
            };

            // Показываем при наведении
            container.addEventListener('mouseenter', () => {
              isHovered = true;
              clearTimeout(hideTimeout);
              show();
            });

            // Прячем при уходе мыши (с задержкой)
            container.addEventListener('mouseleave', () => {
              isHovered = false;
              if (!isOpen) {
                hideTimeout = setTimeout(hide, 1500); // Ждем 1.5 сек перед скрытием
              }
            });

            // Начальная анимация (показать и спрятать через 2 сек)
            setTimeout(show, 500);
            setTimeout(hide, 2500);

            // --- Клик (открытие iframe) ---
            btn.onclick = () => {
              const existingIframe = document.getElementById('u-devtools-iframe');
              
              if (existingIframe) {
                // Toggle visibility
                if (existingIframe.style.display === 'none') {
                  existingIframe.style.display = 'block';
                  isOpen = true;
                  show();
                } else {
                  existingIframe.style.display = 'none';
                  isOpen = false;
                  // При закрытии можно сразу не прятать кнопку, пусть юзер сам уберет мышь
                }
                return;
              }

              // Create Iframe
              const iframe = document.createElement('iframe');
              iframe.id = 'u-devtools-iframe';
              iframe.src = '${base}/index.html';
              iframe.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; z-index:100000; border:none; background:transparent;';
              document.body.appendChild(iframe);
              isOpen = true;
              show();

              // Кнопка закрытия внутри Iframe (или поверх)
              // В нашем случае Iframe перекрывает все, поэтому кнопку закрытия лучше рендерить ВНУТРИ Iframe (в Shell)
              // Или добавить кнопку поверх Iframe здесь:
              
              const closeBtn = document.createElement('button');
              closeBtn.innerHTML = '✕';
              closeBtn.style.cssText = 'position:fixed; top:20px; right:20px; z-index:100001; width:36px; height:36px; border-radius:50%; background:#ef4444; color:#fff; border:none; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s;';
              closeBtn.onmouseenter = () => closeBtn.style.transform = 'scale(1.1)';
              closeBtn.onmouseleave = () => closeBtn.style.transform = 'scale(1)';
              
              closeBtn.onclick = () => {
                iframe.style.display = 'none';
                closeBtn.style.display = 'none';
                isOpen = false;
                hideTimeout = setTimeout(hide, 1000);
              };
              
              // Хак: сохраняем ссылку на кнопку закрытия, чтобы показывать её при повторном открытии
              iframe.dataset.hasCloseBtn = 'true';
              
              // Модифицируем btn.onclick для повторного открытия, чтобы он показывал и кнопку закрытия
              const originalClick = btn.onclick;
              btn.onclick = () => {
                 if (iframe.style.display === 'none') {
                    iframe.style.display = 'block';
                    closeBtn.style.display = 'flex';
                    isOpen = true;
                    show();
                 } else {
                    iframe.style.display = 'none';
                    closeBtn.style.display = 'none';
                    isOpen = false;
                 }
              };

              document.body.appendChild(closeBtn);
            };

          })();
        </script>
      `;

      return `${html}${appScript}${launcherScript}`;
    },
  };
}
