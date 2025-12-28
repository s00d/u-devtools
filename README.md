# 🛠️ Universal DevTools Kit

![npm version](https://img.shields.io/npm/v/@u-devtools/vite?color=indigo&style=flat-square)
![license](https://img.shields.io/npm/l/@u-devtools/vite?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)

Universal DevTools Kit is a framework-agnostic, extensible architecture for building debugging tools for Vite applications.

Unlike framework-specific tools (like Vue DevTools or React DevTools), this kit allows you to build tools that work across Vue, React, Svelte, Lit, and Vanilla JS. It provides a robust RPC bridge between the Node.js server, the browser client (iframe), and the application runtime.

## Why use this?

- You want to build a custom debugger for your design system.
- You need a specific file-system tool (e.g., i18n editor, route manager) inside the browser.
- You want a unified DevTools experience for your company's mono-stack.

## ✨ Features

- ⚡️ **Framework Agnostic:** The DevTools shell is built with Vue 3, but plugins can render their UI using any framework (React, Svelte, Vue, or Vanilla DOM) via Mount Adapters.
- 🔌 **Full-Stack Plugins:** Plugins can execute code in three contexts:
  - **Server (Node.js):** Access file system, database, Vite config.
  - **Client (DevTools UI):** Render panels, settings, and visualizations.
  - **App (Window):** Inspect DOM, intercept Network requests, access global window objects.
- 🌉 **Robust Bridge:** Typed RPC (Remote Procedure Call) over WebSocket (Vite HMR) for seamless bi-directional communication.
- 🎨 **UI Kit Included:** Comes with `@u-devtools/ui`, a set of beautiful, accessible components powered by UnoCSS.
- ⌨️ **Developer Experience:** Built-in Command Palette (Cmd+K), Persistent Storage API, and Notifications.
- 📦 **Zero Config:** Auto-injects into your Vite project. No manual script tags required.

## 🚀 Quick Start

### 1. Installation

Install the host package and the plugins you want to use:

```bash
# npm
npm install -D @u-devtools/vite @u-devtools/plugin-i18n @u-devtools/plugin-network @u-devtools/plugin-inspector

# pnpm
pnpm add -D @u-devtools/vite @u-devtools/plugin-i18n @u-devtools/plugin-network @u-devtools/plugin-inspector
```

### 2. Configuration

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';

// Plugins
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { networkPlugin } from '@u-devtools/plugin-network';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        // Translation Editor (reads/writes JSON files)
        i18nPlugin({ dir: 'src/locales' }),
        
        // Network Logger (fetch/XHR)
        networkPlugin(),
        
        // DOM Inspector
        inspectorPlugin()
      ]
    })
  ]
});
```

### 3. Usage

Start your development server (`vite dev`). You will see a floating 🛠 (Hammer) button in the bottom-right corner. Click it to open the DevTools.

## 📦 Official Plugins

| Plugin | Package | Description |
|--------|---------|-------------|
| **I18n** | `@u-devtools/plugin-i18n` | Visual editor for JSON translation files. Supports "Open in Editor". |
| **Network** | `@u-devtools/plugin-network` | Captures fetch and XMLHttpRequest events. Filtering and status badges. |
| **Inspector** | `@u-devtools/plugin-inspector` | Select DOM elements on your page to inspect attributes and dimensions. |

## 🏗 Architecture

The architecture consists of three distinct layers. Understanding this helps when writing custom plugins.

```
┌─────────────────────────────────────────────────────────┐
│  Node.js (Vite Server)                                  │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ Vite Plugin  │◄─┤ Plugin Server     │                │
│  │    Host      │  │     Logic        │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
                        │
                        │ RPC (WebSocket)
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Browser (Iframe)                                       │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ DevTools     │◄─┤ Plugin UI        │                │
│  │    Shell     │  │   Components     │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ BroadcastChannel
                        │
┌─────────────────────────────────────────────────────────┐
│  Browser (User App)                                     │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ App Runtime  │◄─┤ Plugin App       │                │
│  │              │  │     Logic        │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

- **Server (Host):** Runs inside the Vite Dev Server. Responsible for file I/O and handling RPC requests from the client.
- **Client (Shell):** An isolated Vue 3 application running inside an iframe. It loads plugin UIs and manages the state.
- **App (Runtime):** Scripts injected into the user's main window. Used for DOM inspection, network interception, or accessing global variables.

## 🧩 Plugin Development Guide

Creating a plugin is simple. A plugin is a function that returns a `DevToolsPlugin` object.

### Directory Structure

Recommended structure for a plugin:

```
my-plugin/
├── src/
│   ├── index.ts       # Entry point
│   ├── server.ts      # Node.js logic
│   ├── client.ts      # UI definition
│   ├── app.ts         # (Optional) Browser runtime logic
│   └── MyPanel.vue    # Vue Component (or React/Svelte)
```

### 1. Plugin Definition (index.ts)

```ts
import type { DevToolsPlugin } from '@u-devtools/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const myPlugin = (): DevToolsPlugin => ({
  name: 'My Plugin',
  // Path to the UI logic (bundled by Vite)
  clientPath: path.resolve(__dirname, './client.ts'),
  // Path to the App logic (injected into index.html)
  appPath: path.resolve(__dirname, './app.ts'),
  // Server-side setup
  setupServer: (rpc, ctx) => {
    rpc.handle('my-plugin:greet', (name) => `Hello, ${name} from Node.js!`);
  }
});
```

### 2. Client UI (client.ts)

You can render any content into the container. We provide a helper for Vue, but you can use ReactDOM.render or vanilla JS.

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './MyPanel.vue';

const client: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'i-carbon-wand', // UnoCSS icon class
  
  // Register commands for the Command Palette (Ctrl+K)
  commands: [
    {
      id: 'greet',
      label: 'Say Hello',
      action: () => console.log('Hello!')
    }
  ],

  // Render the Main View
  renderMain(container, api) {
    const app = createApp(MyPanel, { api });
    app.mount(container);
    // Return unmount function to clean up memory
    return () => app.unmount();
  }
};

export default client;
```

### 3. Using the UI Kit (MyPanel.vue)

We export a set of components from `@u-devtools/ui` to ensure consistency.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UInput, UBadge } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();
const response = ref('');

async function callServer() {
  // Call the Node.js method defined in index.ts
  response.value = await props.api.rpc.call('my-plugin:greet', 'Developer');
  
  // Show a toast notification
  props.api.notify('Data received!', 'success');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">My Custom Plugin</h1>
    <UButton variant="primary" icon="i-carbon-send" @click="callServer">
      Call Node.js
    </UButton>
    <div class="mt-4">
      <UBadge color="green" v-if="response">{{ response }}</UBadge>
    </div>
  </div>
</template>
```

## 📚 API Reference

### ClientApi

This object is passed to your render functions in the client.

| Property | Type | Description |
|----------|------|-------------|
| `rpc` | `RpcClientInterface` | Communication with the Node.js server. |
| `storage` | `StorageApi` | Persist data in LocalStorage (scoped to plugin). |
| `notify` | `(msg, type) => void` | Show a toast notification. |

#### rpc

- `call(method: string, payload?: any): Promise<any>` - Execute a server method.
- `on(event: string, callback: Function)` - Listen for server events.

#### storage

- `get(key, default)` - Get a value.
- `set(key, value)` - Save a value.
- `remove(key)` - Delete a value.

## 🎨 UI Kit & Icons

The project uses UnoCSS for styling and icons.

You can use any icon from the Iconify library by using the class name:

```html
<!-- Material Design Icon -->
<div class="i-mdi-home" />

<!-- Carbon Icon -->
<div class="i-carbon-settings" />
```

Available components in `@u-devtools/ui`:

- `UButton`
- `UInput`
- `USelect`
- `UBadge`
- `UTable`
- `UIcon`
- `UCodeBlock`

## 🤝 Contributing

This project is a monorepo managed by pnpm.

1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Build packages: `pnpm build`.
4. Run the playground: `cd playground && pnpm dev`.

### Testing

We use Vitest for testing the core logic and bridge.

```bash
pnpm test
```

## 📄 License

MIT License © 2025-present.
