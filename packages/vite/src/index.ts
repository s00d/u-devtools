import type { PluginOption, ViteDevServer, ResolvedConfig } from 'vite';
import { ViteRpcServer } from '@u-devtools/bridge';
import type { DevToolsPlugin, RpcMessage } from '@u-devtools/core';
import { normalizePath } from '@u-devtools/utils-node';
import { extractErrorMessage } from '@u-devtools/utils';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use createRequire for reliable resolution in monorepo and node_modules
const require = createRequire(import.meta.url);

// Identifiers
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

  // --- DISABLE LOGIC ---
  if (!enabled) {
    return {
      name: 'u-devtools',
      apply: 'serve',
      // Return empty plugin so Vite doesn't complain, but nothing happens
    };
  }

  // --- 1. PATH RESOLUTION (CLIENT & OVERLAY) ---

  const isRunningFromSrc = import.meta.url.endsWith('.ts');

  let clientEntryPath: string;
  let overlayEntryPath: string;

  if (isRunningFromSrc) {
    // DEV MODE (Monorepo)
    clientEntryPath = path.resolve(__dirname, '../../client/src/main.ts');
    overlayEntryPath = path.resolve(__dirname, '../../overlay/src/main.ts');
  } else {
    // PROD MODE (User usage)
    try {
      const clientPkgPath = require.resolve('@u-devtools/client/package.json');
      const clientRoot = path.dirname(clientPkgPath);
      const clientPkg = require(clientPkgPath);
      // For build use dist version
      clientEntryPath = path.resolve(clientRoot, 'dist/main.js');

      const overlayPkgPath = require.resolve('@u-devtools/overlay/package.json');
      const overlayRoot = path.dirname(overlayPkgPath);
      const overlayPkg = require(overlayPkgPath);
      overlayEntryPath = path.resolve(overlayRoot, 'dist/index.js');
    } catch (e: unknown) {
      const errorMessage = extractErrorMessage(e);
      throw new Error(
        `[u-devtools] Failed to resolve dependencies.\n` +
        `Ensure you have installed: @u-devtools/client and @u-devtools/overlay\n` +
        `Error: ${errorMessage}`
      );
    }
  }

  // Normalize paths for Windows
  clientEntryPath = normalizePath(clientEntryPath);
  overlayEntryPath = normalizePath(overlayEntryPath);

  // Vite config
  let config: ResolvedConfig;
  // Chunk references for production build
  let clientRefId: string | undefined;
  let overlayRefId: string | undefined;

  // Collect all Vite plugins from DevTools plugins
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

  // WebSocket server setup for remote debugging
  // Save references for cleanup on HMR
  let wssInstance: any = null;
  let upgradeHandlerRef: ((request: any, socket: any, head: any) => void) | null = null;

  const setupWebSocketServer = (server: ViteDevServer) => {
    const httpServer = server.httpServer;
    if (!httpServer) {
      console.warn('[u-devtools] HTTP server not available, WebSocket support disabled');
      return;
    }

    // Remove old handler if it was added earlier (HMR)
    if (upgradeHandlerRef && httpServer) {
      httpServer.removeListener('upgrade', upgradeHandlerRef);
    }

    // IMPORTANT: Create ONE WebSocketServer for all connections
    const { WebSocketServer } = require('ws');

    // If server already exists, close old connections
    if (wssInstance) {
      wssInstance.close();
    }

    wssInstance = new WebSocketServer({ noServer: true });
    // Increase listener limit to prevent warnings
    wssInstance.setMaxListeners(50);

    // Upgrade handler for WebSocket connections
    upgradeHandlerRef = (request: any, socket: any, head: any) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      if (url.pathname === '/__u-devtools-ws') {
        wssInstance.handleUpgrade(request, socket, head, (ws: any) => {
          // IMPORTANT: Pass wss (server instance) to have access to all clients
          handleWebSocketConnection(ws, wssInstance, server);
        });
      }
    };

    httpServer.on('upgrade', upgradeHandlerRef);
  };

  // WebSocket connection handler
  // Add wss argument for access to all clients
  const handleWebSocketConnection = (ws: any, wss: any, server: ViteDevServer) => {
    // Create WebSocket adapter compatible with ViteRpcServer
    const wsAdapter = {
      on: (event: string, handler: any) => {
        if (event === 'u-devtools:request') {
          ws.on('message', (data: Buffer) => {
            try {
              const msg = JSON.parse(data.toString());
              handler(msg, {
                // send for responding to specific request (Unicast)
                send: (type: string, data: unknown) => {
                  const response: RpcMessage = {
                    ...(data as RpcMessage),
                    type: type === 'u-devtools:event' ? 'event' : 'response',
                  };
                  if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.send(JSON.stringify(response));
                  }
                },
              });
            } catch (err) {
              console.error('[u-devtools] WebSocket message parse error:', err);
            }
          });
        }
      },
      // send is used by ViteRpcServer for BROADCAST
      send: (event: string, data: unknown) => {
        const message: RpcMessage = {
          ...(data as RpcMessage),
          type: event === 'u-devtools:event' ? 'event' : 'response',
        };
        const msgString = JSON.stringify(message);

        // FIX: Broadcast to all clients
        if (wss?.clients) {
          wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
              try {
                client.send(msgString);
              } catch (err) {
                console.error('[Vite WS] Failed to send to client:', err);
              }
            }
          });
        } else {
          // Fallback if wss is unavailable (shouldn't happen)
          ws.send(msgString);
        }
      },
    };

    const rpcServer = new ViteRpcServer(wsAdapter);
    const ctx = { root: server.config.root, server };

    // Setup plugins for WebSocket connection
    plugins.forEach((p) => {
      if (p.setupServer) {
        try {
          p.setupServer(rpcServer, ctx);
        } catch (e) {
          const error = extractErrorMessage(e);
          console.error(`[u-devtools] Error setting up plugin ${p.name}:`, error);
        }
      }
    });

    // Basic handlers
    rpcServer.handle('sys:getPlugins', () => plugins.map((p) => ({
      name: p.name,
      // Return clientPath so remote client can load it
      clientPath: p.clientPath,
      meta: p.meta
    })));

    ws.on('close', () => {
      // Cleanup on connection close
    });
  };

  // Main plugin (works in both dev and build)
  const mainPlugin: PluginOption = {
    name: 'u-devtools',
    // REMOVE apply: 'serve' so plugin works in build too
    enforce: 'pre', // Process virtual modules early

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    config() {
      return {
        optimizeDeps: {
          // IMPORTANT: Exclude packages from pre-bundling.
          // Vite will process files inside node_modules as source code:
          // 1. import.meta.hot will be preserved (HMR will work).
          // 2. CSS imports will resolve correctly (styles will be fixed).
          exclude: [
            '@u-devtools/client',
            '@u-devtools/overlay',
            '@u-devtools/kit',
          ],
        },
        // For reliability explicitly allow FS access
        server: {
          fs: {
            allow: ['node_modules/@u-devtools'],
          },
        },
        // Override resolve.alias to handle @/ for plugin files
        // We can't use functions in alias, so we'll handle it in resolveId
        resolve: {
          alias: [
            // Keep existing aliases but add our custom resolver
            // The actual resolution will happen in resolveId hook
          ],
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
        // Normalize paths for Windows compatibility
        const imports = clientPlugins
          .map(
            (p, i) => `import plugin${i} from '${p.clientPath ? normalizePath(p.clientPath) : ''}'`
          )
          .join('\n');
        const exports = `export const plugins = [${clientPlugins.map((_, i) => `plugin${i}`).join(', ')}]`;
        return `${imports}\n${exports}`;
      }

      if (id === RESOLVED_APP_ID) {
        const appPlugins = plugins.filter((p) => p.appPath);
        if (appPlugins.length === 0) return 'export const appPlugins = [];';

        // 1. Import modules
        const imports = appPlugins
          .map((p, i) => {
            if (!p.appPath) return '';
            return `import * as plugin_${i} from '${normalizePath(p.appPath)}'`;
          })
          .filter(Boolean)
          .join('\n');

        // 2. Export array of objects with metadata and the module itself
        // We take .default from module, as defineApp is export default
        const exports = `export const appPlugins = [
          ${appPlugins.map((p, i) => `{ 
            name: '${p.name}', 
            definition: plugin_${i}.default 
          }`).join(',\n          ')}
        ];`;

        return `${imports}\n${exports}`;
      }
      return null;
    },

    // --- PRODUCTION BUILD LOGIC ---
    async buildStart(opts) {
      // !!! In development mode (serve) emitFile is not needed and causes error.
      // Logic for dev mode is handled below in transformIndexHtml/configureServer.
      if (config.command === 'serve') {
        return;
      }
      // !!! END OF BLOCK !!!

      // Check that we're actually in build mode
      // buildStart can be called in serve mode for pre-bundling dependencies
      // Check via opts.mode or presence of emitFile method in context
      // In dev mode emitFile is unavailable, so just check its presence
      if (typeof this.emitFile !== 'function') {
        return;
      }

      // Ask Rollup to build client and overlay files as separate chunks
      clientRefId = this.emitFile({
        type: 'chunk',
        id: clientEntryPath,
        fileName: `${base.replace(/^\//, '')}/client.js`, // e.g. __devtools/client.js
      });

      overlayRefId = this.emitFile({
        type: 'chunk',
        id: overlayEntryPath,
        fileName: `${base.replace(/^\//, '')}/overlay.js`, // e.g. __devtools/overlay.js
      });

      // Also generate chunk for app plugins if they exist
      const appPlugins = plugins.filter((p) => p.appPath);
      if (appPlugins.length > 0) {
        // Use virtual module for app plugins
        // The virtual module will be resolved by resolveId hook
        this.emitFile({
          type: 'chunk',
          id: RESOLVED_APP_ID,
          fileName: `${base.replace(/^\//, '')}/app-plugins.js`,
        });
      }
    },

    generateBundle(_options, bundle) {
      // generateBundle is only called in build mode
      // Get generated chunk file names
      const clientFileName = clientRefId ? this.getFileName(clientRefId) : null;
      const overlayFileName = overlayRefId ? this.getFileName(overlayRefId) : null;

      if (!clientFileName || !overlayFileName) {
        console.warn('[u-devtools] Failed to get chunk file names');
        return;
      }

      // Use base from config if initialized
      const publicBase = config?.base || '/';

      // Find main index.html in bundle
      const htmlAsset = Object.values(bundle).find(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('index.html')
      ) as { source: string } | undefined;

      if (htmlAsset) {
        // Inject scripts and config
        const configScript = `<script>window.__UDEVTOOLS_CONFIG__={base:'${base}'};</script>`;

        // For plugin applications
        const appPlugins = plugins.filter((p) => p.appPath);
        const appPluginsScript =
          appPlugins.length > 0
            ? `<script type="module" src="${publicBase}${base.replace(/^\//, '')}/app-plugins.js"></script>`
            : '';

        // References to our generated files
        const overlayScript = `<script type="module" src="${publicBase}${overlayFileName}"></script>`;

        // Insert before closing body
        htmlAsset.source = String(htmlAsset.source).replace(
          '</body>',
          `${configScript}${appPluginsScript}${overlayScript}</body>`
        );
      }

      // Create index.html for DevTools Client itself
      this.emitFile({
        type: 'asset',
        fileName: `${base.replace(/^\//, '')}/index.html`, // e.g. __devtools/index.html
        source: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Universal DevTools</title>
              <style>
                html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #0f172a; }
              </style>
            </head>
            <body>
              <div id="app"></div>
              <script type="module" src="${publicBase}${clientFileName}"></script>
            </body>
          </html>
        `,
      });
    },

    // --- DEV SERVER LOGIC ---
    configureServer(server: ViteDevServer) {
      // Set Vite server context for @vue/devtools-kit if available
      try {
        const { setViteServerContext } = require('@vue/devtools-kit');
        setViteServerContext(server);
      } catch (_e) {
        // @vue/devtools-kit might not be available, ignore
      }

      // Start WebSocket server for remote debugging
      setupWebSocketServer(server);

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

      rpcServer.handle('sys:getPlugins', () => plugins.map((p) => ({
        name: p.name,
        // Return clientPath so remote client can load it
        clientPath: p.clientPath,
        meta: p.meta
      })));
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
        // launch-editor uses LAUNCH_EDITOR environment variable to select editor
        // Temporarily set it if not set
        const originalEditor = process.env.LAUNCH_EDITOR;
        if (!originalEditor && editor) {
          process.env.LAUNCH_EDITOR = editor;
        }
        try {
          open(filePath, `:${line}:${column}`);
        } finally {
          // Restore original value if we changed it
          if (!originalEditor && editor) {
            delete process.env.LAUNCH_EDITOR;
          }
        }
      });

      // --- PLUGIN MANAGER CORE LOGIC ---
      // Get plugin list (stays in core, as this is system information)
      rpcServer.handle('sys:plugins:list', () => {
        return plugins.map((p) => ({
          name: p.name,
          // Only manager is a core plugin and cannot be removed
          isCore: p.name.toLowerCase() === 'manager',
          meta: {
            ...(p.meta || {
              name: 'unknown',
              version: '0.0.0',
              description: 'No description provided',
            }),
            // Support both fields for backward compatibility
            repository: p.meta?.repository,
          },
        }));
      });

      // 3. Endpoint for reading HttpOnly cookies
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
              httpOnly: true, // Mark as server-side
            };
          })
          .filter((c) => c.key);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(cookies));
      });

      // 4. Serve Shell (wrapper) - SPA fallback for routing
      // Handle all requests under base that are not static files
      server.middlewares.use((req, res, next) => {
        const url = req.url || '/';

        // If request starts with base and is not a static file (no extension)
        // or it's a direct request to root or index.html
        if (
          (url.startsWith(base) && !url.includes('.')) ||
          url === `${base}/index.html` ||
          url === `${base}/`
        ) {
          // Serve HTML for SPA, but DON'T rewrite req.url
          // This allows Vue Router to correctly determine current route from window.location
          res.setHeader('Content-Type', 'text/html');
          // Normalize path for Windows compatibility
          const normalizedPath = normalizePath(clientEntryPath);
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
          return;
        }

        next();
      });
    },

    transformIndexHtml(html) {
      // transformIndexHtml works in both build and serve.
      // But in build we use generateBundle for precise injection with chunk names.
      // So here we only handle 'serve'.

      if (config.command === 'serve') {
        const appPlugins = plugins.filter((p) => p.appPath);

        // In Dev mode use virtual IDs and FS paths
        const appScript =
          appPlugins.length > 0
            ? `<script type="module">import "/@id/${VIRTUAL_APP_ID}";</script>`
            : '';

        // Normalize overlay path for Windows
        const normalizedOverlayPath = normalizePath(overlayEntryPath);

        // Inject Overlay (Button + Container)
        // IMPORTANT: Pass configuration (BASE URL) via global variable,
        // as <script type="module"> doesn't have document.currentScript
        // FIX: Use Object.assign to avoid overwriting data from Electron preload
        const loaderScript = `
          <script>
            window.__UDEVTOOLS_CONFIG__ = Object.assign(
              window.__UDEVTOOLS_CONFIG__ || {}, 
              { base: '${base}' }
            );
          </script>
          <script type="module" src="/@fs/${normalizedOverlayPath}"></script>
        `;

        return `${html}${appScript}${loaderScript}`;
      }

      // In build mode return html as-is, modification will be in generateBundle
      return html;
    },
  };

  // If there are additional Vite plugins, return array
  const allPlugins: PluginOption[] = [mainPlugin];
  if (vitePluginsFromDevTools.length > 0) {
    allPlugins.push(...vitePluginsFromDevTools.filter((p): p is PluginOption => p != null));
  }

  return allPlugins;
}
