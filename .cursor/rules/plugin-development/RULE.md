---
description: "Guidelines for creating DevTools plugins: structure, API usage, and best practices"
globs:
  - "plugins/**/*.ts"
  - "plugins/**/*.vue"
alwaysApply: false
---

# Plugin Development Guide

## Using definePlugin Helper

The `definePlugin` helper from `@u-devtools/kit` simplifies plugin creation:

```typescript
import { definePlugin } from '@u-devtools/kit/define-plugin';

export const myPlugin = () => definePlugin({
  name: 'My Plugin',
  root: import.meta.url, // Required: pass import.meta.url
  client: './client', // Optional: defaults to './client', can be null
  app: './app', // Optional: can be null
  server: './server', // Optional: defaults to './server', can be null
  setupServer: (rpc, ctx) => { /* custom setup */ }, // Optional: ignored if server is specified
  useDist: false, // Optional: force use dist paths in dev mode
  meta: {
    name: '@u-devtools/plugin-my-plugin',
    version: '0.1.0',
    description: 'Description'
  }
});
```

**Important:** 
- `root` must be `import.meta.url` for path resolution
- `client`, `app`, `server` can be `null` to disable loading
- If `server` path is specified, `setupServer` function is ignored (server module is auto-loaded)

## Client Definition (client.ts)

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './ui/MyPanel.vue';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube', // Heroicons icon name
  
  // Hide from main menu (accessible only via General menu)
  hideFromMenu: false, // Optional: default false
  
  // Add items to General menu
  generalMenuItems: [ // Optional
    {
      label: 'Extensions',
      icon: 'Squares2X2',
      action: (api) => {
        api.navigation.openPlugin('Plugins');
      }
    }
  ],
  
  // Settings schema
  settings: {
    mySetting: {
      label: 'My Setting',
      type: 'string',
      default: 'value'
    }
  },
  
  renderMain(container, api) {
    const app = createApp(MyPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
  
  // Optional: render sidebar panel
  renderSidebar(container, api) {
    const app = createApp(SidebarPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
  
  // Optional: render settings panel
  renderSettings(container, api) {
    const app = createApp(SettingsPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

## Server Setup (server.ts)

```typescript
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // RPC handlers: payload type is always unknown, use type assertion
  rpc.handle('my-plugin:method', async (payload: unknown) => {
    const data = payload as { key: string };
    return { result: 'data' };
  });
  
  // Broadcast events to all clients
  rpc.broadcast('my-plugin:update', { data: Date.now() });
}
```

**Note:** If using `server: './server'` in `definePlugin`, the module is auto-loaded and `setupServer` function is called automatically.

## App Script (app.ts) - HMR Cleanup Required

```typescript
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  // Patch logic
  return originalFetch(...args);
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.fetch = originalFetch; // Restore
    bridge.close();
  });
}
```

## Best Practices

- Always restore patches in HMR cleanup
- Use isolated storage/settings scope (automatic via plugin name)
- Handle RPC errors with try/catch
- Use `computed` for reactive settings
- Export `PluginClientInstance` as default
- All code, comments, and documentation must be in English
- RPC handler payloads are `unknown` - use type assertions

## Plugin Naming

- Universal plugins: `@u-devtools/plugin-{name}`
- Framework-specific: `@u-devtools/plugin-{framework}-{name}`

Examples:
- `@u-devtools/plugin-network` (universal)
- `@u-devtools/plugin-vue-inspector` (Vue-specific)
