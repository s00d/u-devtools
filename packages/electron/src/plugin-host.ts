import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, access } from 'node:fs/promises'; // Added access
import { extname, join, dirname, basename, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { EventEmitter } from 'node:events';
import { ViteRpcServer } from '@u-devtools/bridge';
import { createRequire } from 'node:module';
import type { DevToolsPlugin, RpcMessage, ServerContext } from '@u-devtools/core';

const require = createRequire(import.meta.url);

export class PluginHost {
  private wss: WebSocketServer | null = null;
  private httpServer: ReturnType<typeof createServer> | null = null;
  private plugins: DevToolsPlugin[] = [];
  private isDev = false;
  // URL of external Vite server (UI), e.g. http://localhost:5173
  private viteServerUrl: string | null = null;
  // Callback for saving config
  private onSaveConfig?: (data: Record<string, any>) => void;
  
  constructor(private port: number = 3000) {}

  public setDevMode(isDev: boolean) {
    this.isDev = isDev;
  }
  
  // Add setter for Vite server URL
  public setViteServerUrl(url: string) {
    this.viteServerUrl = url;
  }

  // Setter for config save handler
  public setConfigHandler(fn: (data: Record<string, any>) => void) {
    this.onSaveConfig = fn;
  }

  public addPlugin(plugin: DevToolsPlugin) {
    this.plugins.push(plugin);
  }

  // Helper for serving files
  private async serveFile(res: any, filePath: string, contentType = 'application/javascript') {
    try {
      await access(filePath); // Check availability
      const stats = await stat(filePath);
      
      if (!stats.isFile()) throw new Error('Not a file');
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const stream = createReadStream(filePath);
      await pipeline(stream, res);
    } catch (e) {
      console.warn(`[PluginHost] 404 Not Found: ${filePath}`);
      if (!res.headersSent) {
        res.statusCode = 404;
        res.end('Not found');
      }
    }
  }

  public async start(rootPath: string) {
    return new Promise<number>((resolvePromise, reject) => {
      this.httpServer = createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const url = req.url || '/';
        if (req.headers.upgrade === 'websocket') return;

        // 2. PLUGINS FILES
        if (url.startsWith('/plugins/')) {
          const parts = url.split('/plugins/')[1]?.split('/');
          const pluginNameFromUrl = parts?.[0]?.toLowerCase(); // Convert to lowercase for search
          const fileName = parts?.slice(1).join('/');

          if (pluginNameFromUrl && fileName) {
            // Find plugin (compare in lowercase too)
            const plugin = this.plugins.find(p => {
              const name = p.name
                .replace('@u-devtools/plugin-', '')
                .replace('u-devtools-plugin-', '')
                .toLowerCase();
              return name === pluginNameFromUrl;
            });
            
            if (plugin?.clientPath) {
              let fileToSend = '';

              // FILE SEARCH LOGIC ON DISK
              // If we're in Dev and path points to src, we need to find dist
              if (this.isDev && plugin.clientPath.includes('/src/')) {
                // .../plugins/tailwind/src/client.ts  -> .../plugins/tailwind/
                // Get directory one level above src
                const pluginRoot = resolve(dirname(plugin.clientPath), '..');
                // Look in dist
                fileToSend = join(pluginRoot, 'dist', fileName);
              } 
              // If path already points to dist or this is prod build
              else {
                const dir = dirname(plugin.clientPath);
                // If requesting client.js itself (or its variations)
                if (fileName === 'client.js' || fileName === 'client.es.js' || fileName === basename(plugin.clientPath)) {
                  fileToSend = plugin.clientPath;
                } else {
                  // Assets inside folder
                  fileToSend = join(dir, fileName);
                }
              }

              const ext = extname(fileToSend);
              const mimeTypes: Record<string, string> = {
                '.js': 'application/javascript',
                '.mjs': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.svg': 'image/svg+xml',
              };
              
              await this.serveFile(res, fileToSend, mimeTypes[ext] || 'text/plain');
              return;
            } else {
              console.warn(`[PluginHost] Plugin not found for URL segment: ${pluginNameFromUrl}`);
            }
          }
        }
        
        res.statusCode = 404;
        res.end('Not found');
      });

      // 2. Start WebSocket server on top of HTTP
      this.wss = new WebSocketServer({ server: this.httpServer });

      console.log(`[PluginHost] Starting server on port ${this.port}`);

      this.wss.on('connection', (ws) => {
        // console.log('[PluginHost] Client connected');
        this.handleConnection(ws, rootPath);
      });

      this.httpServer.listen(this.port, () => {
        console.log(`[PluginHost] Server started on port ${this.port}`);
        resolvePromise(this.port);
      });

      this.httpServer.on('error', (error) => {
        console.error('[PluginHost] Server error:', error);
        reject(error);
      });
    });
  }

  private handleConnection(ws: WebSocket, rootPath: string) {
    const wss = this.wss;
    const transportAdapter = {
      on: (event: string, handler: any) => {
        if (event === 'u-devtools:request') {
          ws.on('message', (data) => {
            try {
              const msg = JSON.parse(data.toString()) as RpcMessage;
              if (msg.type === 'request') {
                handler(msg, {
                  send: (type: string, data: unknown) => {
                     const response = { ...data as any, type: type === 'u-devtools:event' ? 'event' : 'response' };
                     if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(response));
                  }
                });
              }
            } catch {}
          });
        }
      },
      send: (event: string, data: any) => {
        if (!wss) return;
        const msgString = JSON.stringify(data);
        wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msgString); });
      }
    };

    const rpcServer = new ViteRpcServer(transportAdapter);
    
    // MOCK for plugins
    const mockViteServer = {
      config: { root: rootPath },
      ws: { 
        on: () => {}, 
        send: () => {}, 
        clients: wss ? wss.clients : new Set() 
      },
      watcher: new EventEmitter()
    };

    const ctx: ServerContext = { root: rootPath, server: mockViteServer as unknown };

    // === ADD sys:saveConfig HANDLER ===
    rpcServer.handle('sys:saveConfig', (payload) => {
      if (this.onSaveConfig) {
        this.onSaveConfig(payload as Record<string, any>);
        return { success: true };
      }
      return { success: false, error: 'Config saving not supported' };
    });

    // === MAIN LOGIC ===
    rpcServer.handle('sys:getPlugins', () => 
      this.plugins
        .filter((p): p is DevToolsPlugin & { clientPath: string } => !!p.clientPath)
        .map(p => {
          let finalUrl: string;

          // SCENARIO 1: DEV MODE + Vite Server available
          // We use Vite Server to serve sources "as-is" (/@fs/...)
          // This allows working without plugin builds (Hot Module Replacement, TS support)
          if (this.isDev && this.viteServerUrl) {
            // Normalize path: remove file://, replace \ with /
            let rawPath = p.clientPath.replace('file://', '').replace(/\\/g, '/');
            
            // If path doesn't start with /, add it (important for Windows to preserve C:/ drive)
            if (!rawPath.startsWith('/')) rawPath = '/' + rawPath;

            finalUrl = `${this.viteServerUrl}/@fs${rawPath}`;
          } 
          // SCENARIO 2: PROD MODE or Fallback
          // Serve compiled files via our local server (port 3000)
          else {
            const pluginDirName = p.name
              .replace('@u-devtools/plugin-', '')
              .replace('u-devtools-plugin-', '')
              .toLowerCase(); // Convert to lowercase in URL
            
            finalUrl = `http://localhost:${this.port}/plugins/${pluginDirName}/client.js`;
          }
          
          return { 
            name: p.name,
            clientPath: finalUrl,
            meta: p.meta
          };
        })
    );

    this.plugins.forEach(p => { if (p.setupServer) p.setupServer(rpcServer, ctx); });
  }

  public stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.httpServer) {
      this.httpServer.close();
      console.log('[PluginHost] Server stopped');
    }
  }
}
