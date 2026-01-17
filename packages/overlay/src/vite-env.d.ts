/// <reference types="vite/client" />

// Declaration for .vue files
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

// Declaration for ?inline styles
declare module '*?inline' {
  const content: string;
  export default content;
}

// ✅ Declaration for virtual app module
declare module 'virtual:u-devtools-app' {
  import type { Component } from 'vue';
  import type { AppBridge, OverlayContext } from '@u-devtools/core';

  export interface AppContext {
    bridge: AppBridge<any>;
    api?: never;
    onCleanup: (fn: () => void) => void;
  }

  export interface AppPluginDefinition {
    component?: Component;
    setup?: (context: AppContext) => void | Promise<void>;
    menu?: {
      id: string;
      label: string;
      icon: string;
      order?: number;
      action?: string | ((ctx: OverlayContext) => void);
    };
    commands?: Array<{
      id: string;
      label: string;
      icon?: string;
      shortcut?: string[];
      action: (ctx: AppContext) => void | Promise<void>;
    }>;
  }

  export interface AppPluginEntry {
    name: string;
    definition: AppPluginDefinition;
  }

  export const appPlugins: AppPluginEntry[];
}
