import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { ViteDevServer } from 'vite';

/**
 * Server-side RPC handlers for Vue Inspector plugin
 * 
 * Note: Component/Pinia/Router data is accessed directly from app.ts via AppBridge
 * in the client. Server.ts only handles server-side operations if needed.
 */
export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const server = (ctx as { server?: ViteDevServer }).server as ViteDevServer | undefined;

  if (!server) {
    console.error('[Vue Inspector] Vite server instance not found in context');
    return;
  }

  // Component tree - forwarded to app.ts via AppBridge from client
  // This handler is a fallback that returns empty data
  rpc.handle('vue-inspector:getComponentTree', async (payload: unknown) => {
    console.warn('[Vue Inspector] getComponentTree called on server - this should be handled by app.ts via AppBridge');
    return [];
  });

  // Component state
  rpc.handle('vue-inspector:getComponentState', async (payload: unknown) => {
    const { id } = payload as { id: string };
    console.log(`[Vue Inspector] getComponentState called on server: id="${id}"`);
    return null;
  });

  // Pinia tree
  rpc.handle('vue-inspector:getPiniaTree', async (payload: unknown) => {
    const { filter = '' } = payload as { filter?: string };
    console.log(`[Vue Inspector] getPiniaTree called on server: filter="${filter}"`);
    return [];
  });

  // Pinia state
  rpc.handle('vue-inspector:getPiniaState', async (payload: unknown) => {
    const { nodeId } = payload as { nodeId: string };
    console.log(`[Vue Inspector] getPiniaState called on server: nodeId="${nodeId}"`);
    return {};
  });

  // Edit Pinia state - forwarded to app.ts via AppBridge from client
  rpc.handle('vue-inspector:editPiniaState', async () => {
    console.warn('[Vue Inspector] editPiniaState called on server - this should be handled by app.ts via AppBridge');
    return { success: false };
  });

  // Router info
  rpc.handle('vue-inspector:getRouterInfo', async () => {
    console.log('[Vue Inspector] getRouterInfo called on server');
    return null;
  });

  // Navigate to route - forwarded to app.ts via AppBridge from client
  rpc.handle('vue-inspector:navigateToRoute', async () => {
    console.warn('[Vue Inspector] navigateToRoute called on server - this should be handled by app.ts via AppBridge');
    return { success: false };
  });

  // Timeline events
  rpc.handle('vue-inspector:getTimelineEvents', async (payload: unknown) => {
    const { layerId } = payload as { layerId?: string };
    console.log(`[Vue Inspector] getTimelineEvents called on server: layerId="${layerId || 'none'}"`);
    return [];
  });

  // Timeline layers
  rpc.handle('vue-inspector:getTimelineLayers', async () => {
    console.log('[Vue Inspector] getTimelineLayers called on server');
    return [];
  });

  // Highlight component - forwarded to app.ts via AppBridge from client
  rpc.handle('vue-inspector:highlightComponent', async () => {
    console.warn('[Vue Inspector] highlightComponent called on server - this should be handled by app.ts via AppBridge');
    return { success: false };
  });

  // Unhighlight component - forwarded to app.ts via AppBridge from client
  rpc.handle('vue-inspector:unhighlightComponent', async () => {
    console.warn('[Vue Inspector] unhighlightComponent called on server - this should be handled by app.ts via AppBridge');
    return { success: false };
  });

  // Scroll to component - forwarded to app.ts via AppBridge from client
  rpc.handle('vue-inspector:scrollToComponent', async () => {
    console.warn('[Vue Inspector] scrollToComponent called on server - this should be handled by app.ts via AppBridge');
    return { success: false };
  });
}
