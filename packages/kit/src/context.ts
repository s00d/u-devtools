import type { ClientApi, AppBridge } from '@u-devtools/core';

export interface Toast {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

export interface DevToolsContext {
  api?: ClientApi; // Optional, as api is not available in app context
  bridge: AppBridge<any>;
  toast: Toast;
}

/**
 * Creates an isolated context storage for a plugin.
 * 
 * Since each plugin is bundled by Vite, we can use
 * module closure to store context. This is the most reliable, fast and
 * framework-independent way.
 * 
 * @returns Pair of functions: setupDevTools (for initialization) and useDevTools (for usage).
 * 
 * @example
 * ```typescript
 * // In plugin's context.ts
 * import { createDevToolsContext } from '@u-devtools/kit';
 * 
 * export const { setupDevTools, useDevTools } = createDevToolsContext();
 * 
 * // In client.ts
 * import { setupDevTools } from './context';
 * 
 * renderMain(container, api) {
 *   const bridge = new AppBridge('my-plugin');
 *   setupDevTools({ api, bridge });
 *   // ... render UI
 * }
 * 
 * // In component
 * import { useDevTools } from './context';
 * 
 * const { api, bridge, toast } = useDevTools();
 * ```
 */
export function createDevToolsContext() {
  let _context: DevToolsContext | null = null;

  /**
   * Initializes the context. Called once at startup (in renderMain or setup).
   * 
   * @param ctx - Object with api, bridge and optional toast (toast can be created via createToast from @u-devtools/overlay)
   */
  const setupDevTools = (ctx: { api?: ClientApi; bridge: AppBridge<any>; toast?: Toast }) => {
    _context = {
      api: ctx.api, // Optional, can be undefined in app context
      bridge: ctx.bridge,
      // Toast is optional - if not provided, create a stub
      toast: ctx.toast || {
        success: () => {},
        error: () => {},
        info: () => {},
      },
    };
  };

  /**
   * Gets the current context.
   * Works in any function, component or callback after initialization.
   * 
   * @returns Object with api, bridge and toast
   * @throws Error if context is not initialized
   */
  const useDevTools = (): DevToolsContext => {
    if (!_context) {
      throw new Error(
        '[u-devtools] Context not initialized. ' +
        'Call setupDevTools({ bridge, api }) in your entry point.'
      );
    }
    return _context;
  };

  /**
   * Gets bridge from context.
   * 
   * @returns AppBridge
   * @throws Error if context is not initialized
   */
  const useBridge = (): AppBridge<any> => {
    if (!_context) {
      throw new Error(
        '[u-devtools] Context not initialized. ' +
        'Call setupDevTools({ bridge, api }) in your entry point.'
      );
    }
    return _context.bridge;
  };

  /**
   * Gets toast from context.
   * 
   * @returns Toast
   * @throws Error if context is not initialized
   */
  const useToast = (): Toast => {
    if (!_context) {
      throw new Error(
        '[u-devtools] Context not initialized. ' +
        'Call setupDevTools({ bridge, api }) in your entry point.'
      );
    }
    return _context.toast;
  };

  /**
   * Gets api from context.
   * 
   * @returns ClientApi or undefined (if in app context)
   * @throws Error if context is not initialized
   */
  const useApi = (): ClientApi | undefined => {
    if (!_context) {
      throw new Error(
        '[u-devtools] Context not initialized. ' +
        'Call setupDevTools({ bridge, api }) in your entry point.'
      );
    }
    return _context.api;
  };

  return { setupDevTools, useDevTools, useBridge, useToast, useApi };
}

