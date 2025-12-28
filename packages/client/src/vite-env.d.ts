/// <reference types="vite/client" />

declare module 'virtual:u-devtools-plugins' {
  import type { PluginClientInstance } from '@u-devtools/core';
  export const plugins: PluginClientInstance[];
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
