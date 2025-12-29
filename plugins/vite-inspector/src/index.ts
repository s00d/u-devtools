import { definePlugin } from '@u-devtools/kit';
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { setupServer } from './server.js';
import type { ResolvedConfig, ViteDevServer } from 'vite';

// Храним состояние сервера глобально для этого модуля,
// чтобы передать его в setupServer
export let currentConfig: ResolvedConfig | null = null;
export let currentServer: ViteDevServer | null = null;

export const viteInspectorPlugin = () => definePlugin({
  name: 'Vite Inspector',
  root: import.meta.url,
  client: './client',
  
  // --- DEVTOOLS SETUP ---
  setupServer: (rpc: RpcServerInterface, ctx: ServerContext) => {
    const server = ctx.server as ViteDevServer;
    
    // Проверка наличия сервера
    if (!server) {
      console.error('[Vite Inspector] Server not found in context');
      return;
    }
    
    const config = server.config;
    
    // Сохраняем для использования в хуках
    currentConfig = config;
    currentServer = server;
    
    // Перехватываем HMR обновления через WebSocket
    server.ws.on('vite:hmr', (payload) => {
      if (payload && typeof payload === 'object' && 'updates' in payload) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates = (payload as any).updates || [];
        updates.forEach((update: any) => {
          rpc.broadcast('vite:hmr-log', {
            file: update.path || update.file || '',
            timestamp: Date.now(),
            modules: update.acceptedPath ? [update.acceptedPath] : [],
            type: 'update'
          });
        });
      }
    });
    
    // Передаем данные в логику сервера
    setupServer(rpc, ctx, { config, server });
  }
});
