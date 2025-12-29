---
description: "Guidelines for creating DevTools plugins: structure, API usage, and best practices"
globs:
  - "plugins/**/*.ts"
  - "plugins/**/*.vue"
alwaysApply: false
---

# Plugin Development Guide

## Plugin Entry Point (index.ts)

```typescript
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupServer } from './server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const myPlugin = (options?: Options): DevToolsPlugin => ({
  name: 'My Plugin',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'), // Optional
  setupServer: (rpc, ctx) => setupServer(rpc, ctx, options), // Optional
  meta: {
    name: '@u-devtools/plugin-my-plugin',
    version: '0.1.0',
    description: 'Description'
  }
});
```

## Client Definition (client.ts)

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './ui/MyPanel.vue';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube', // Heroicons icon name
  
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
  }
};

export default plugin;
```

## Server Setup (server.ts)

```typescript
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('my-plugin:method', async (payload) => {
    return { result: 'data' };
  });
  
  rpc.broadcast('my-plugin:update', { data: Date.now() });
}
```

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

