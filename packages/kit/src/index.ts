import type { AppBridge, OverlayContext } from '@u-devtools/core';
import type { Component } from 'vue';

// Re-export Web Component utilities (browser-safe, no Node.js dependencies)
export { defineVueElement, defineVueElements, type DefineElementOptions } from './web-components';

// Re-export context factory (framework-agnostic, Module Scope Singleton)
export { createDevToolsContext, type DevToolsContext } from './context';

// Re-export vanilla adapter (pure JS, no framework dependencies)
// For framework-specific adapters, import from:
// '@u-devtools/kit/vue', '@u-devtools/kit/react', '@u-devtools/kit/solid', 
// '@u-devtools/kit/svelte', '@u-devtools/kit/lit'
export * from './vanilla';

// Toast interface is defined in context.ts
// For implementation, import createToast from '@u-devtools/overlay'
export type { Toast } from './context';

// definePlugin is NOT exported from index.ts to avoid bundling Node.js APIs (node:url, node:path) in browser builds
// Import directly from '@u-devtools/kit/define-plugin' in server-side code (Vite plugin context)
// Example: import { definePlugin } from '@u-devtools/kit/define-plugin';

// App Plugin Definition
export interface AppContext {
  bridge: AppBridge<any>;
  /**
   * ClientApi is only available in client context.
   * In app context (overlay), api is not provided as it runs on the page.
   * For app plugins, use module context (Module Singleton) to store the bridge.
   */
  api?: never;
  /**
   * Registers a cleanup function that will be called when the plugin is removed
   * (e.g., during HMR or overlay unmounting).
   */
  onCleanup: (fn: () => void) => void;
}

export interface AppPluginDefinition {
  /**
   * Vue component that will be rendered in the plugins layer (on top of the page)
   */
  component?: Component;
  
  /**
   * Setup function (executed once on startup)
   * Here you can attach global listeners or register menu items
   */
  setup?: (context: AppContext) => void | Promise<void>;
  
  /**
   * Declarative menu (required for plugins with UI in overlay)
   */
  menu?: {
    id: string;
    label: string;
    icon: string;
    order?: number;
    action?: string | ((ctx: OverlayContext) => void);
  };
  
  /**
   * Declarative commands
   */
  commands?: Array<{
    id: string;
    label: string;
    icon?: string;
    shortcut?: string[];
    action: (ctx: AppContext) => void | Promise<void>;
  }>;
}

/**
 * Declarative definition of a plugin part that works in the page context
 */
export function defineApp(def: AppPluginDefinition) {
  return def;
}

