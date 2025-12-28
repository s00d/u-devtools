# Collected Files

## File Structure

```
├── [✓] ▶ .changeset
│   ├── [✓] README.md
│   └── [✓] config.json
├── [✓] ▶ .github
│   └── [✓] ▶ workflows
│       └── [✓] ci.yml
├── [✓] ▶ packages
│   ├── [✓] ▶ bridge
│   │   ├── [✓] ▶ src
│   │   │   └── [✓] index.ts
│   │   ├── [✓] ▶ test
│   │   │   └── [✓] rpc.test.ts
│   │   ├── [✓] package.json
│   │   ├── [✓] tsconfig.json
│   │   ├── [✓] tsup.config.ts
│   │   └── [✓] vitest.config.ts
│   ├── [✓] ▶ client
│   │   ├── [✓] ▶ src
│   │   │   ├── [✓] ▶ components
│   │   │   │   ├── [✓] CommandPalette.vue
│   │   │   │   └── [✓] PluginRenderer.vue
│   │   │   ├── [✓] ▶ composables
│   │   │   │   ├── [✓] useNotifications.ts
│   │   │   │   ├── [✓] usePluginStorage.ts
│   │   │   │   └── [✓] useSettings.ts
│   │   │   ├── [✓] App.vue
│   │   │   ├── [✓] main.ts
│   │   │   ├── [✓] style.css
│   │   │   └── [✓] vite-env.d.ts
│   │   ├── [✓] package.json
│   │   ├── [✓] tsconfig.json
│   │   ├── [✓] uno.config.ts
│   │   └── [✓] vite.config.ts
│   ├── [✓] ▶ core
│   │   ├── [✓] ▶ src
│   │   │   ├── [✓] ▶ utils
│   │   │   │   └── [✓] path.ts
│   │   │   └── [✓] index.ts
│   │   ├── [✓] ▶ tmp
│   │   │   └── [✓] ▶ cache
│   │   │       └── [✓] ▶ vite
│   │   │           └── [✓] last-build-production.json
│   │   ├── [✓] package.json
│   │   ├── [✓] tsconfig.json
│   │   ├── [✓] tsup.config.ts
│   │   └── [✓] vite.config.ts
│   ├── [✓] ▶ kit
│   │   ├── [✓] ▶ src
│   │   │   └── [✓] index.ts
│   │   ├── [✓] package.json
│   │   └── [✓] tsconfig.json
│   ├── [✓] ▶ ui
│   │   ├── [✓] ▶ src
│   │   │   ├── [✓] ▶ components
│   │   │   │   ├── [✓] UBadge.vue
│   │   │   │   ├── [✓] UButton.vue
│   │   │   │   ├── [✓] UCodeBlock.vue
│   │   │   │   ├── [✓] UIcon.vue
│   │   │   │   ├── [✓] UInput.vue
│   │   │   │   ├── [✓] USelect.vue
│   │   │   │   └── [✓] UTable.vue
│   │   │   ├── [✓] ▶ styles
│   │   │   │   └── [✓] main.css
│   │   │   ├── [✓] index.ts
│   │   │   └── [✓] style.css
│   │   ├── [✓] package.json
│   │   ├── [✓] tsconfig.json
│   │   └── [✓] vite.config.ts
│   └── [✓] ▶ vite
│       ├── [✓] ▶ src
│       │   └── [✓] index.ts
│       ├── [✓] package.json
│       ├── [✓] tsconfig.json
│       └── [✓] tsup.config.ts
├── [✓] ▶ playground
├── [✓] ▶ plugins
│   ├── [✓] ▶ i18n
│   │   ├── [✓] ▶ src
│   │   │   ├── [✓] ▶ ui
│   │   │   │   ├── [✓] I18nPanel.vue
│   │   │   │   └── [✓] vue-shim.d.ts
│   │   │   ├── [✓] client.ts
│   │   │   ├── [✓] index.ts
│   │   │   ├── [✓] json-to-ast.d.ts
│   │   │   └── [✓] server.ts
│   │   ├── [✓] README.md
│   │   ├── [✓] package.json
│   │   └── [✓] tsconfig.json
│   ├── [✓] ▶ inspector
│   │   ├── [✓] ▶ src
│   │   │   ├── [✓] ▶ ui
│   │   │   │   ├── [✓] InspectorPanel.vue
│   │   │   │   └── [✓] vue-shim.d.ts
│   │   │   ├── [✓] app.ts
│   │   │   ├── [✓] client.ts
│   │   │   └── [✓] index.ts
│   │   ├── [✓] README.md
│   │   ├── [✓] package.json
│   │   └── [✓] tsconfig.json
│   └── [✓] ▶ network
│       ├── [✓] ▶ src
│       │   ├── [✓] ▶ ui
│       │   │   ├── [✓] NetworkPanel.vue
│       │   │   └── [✓] vue-shim.d.ts
│       │   ├── [✓] app.ts
│       │   ├── [✓] client.ts
│       │   └── [✓] index.ts
│       ├── [✓] README.md
│       ├── [✓] package.json
│       └── [✓] tsconfig.json
├── [✓] ▶ shared
│   └── [✓] vite.config.base.ts
├── [✓] ▶ src
├── [✓] .gitignore
├── [✓] .npmignore
├── [✓] CONTRIBUTING.md
├── [✓] LICENSE
├── [✓] README.md
├── [✓] biome.json
├── [✓] package.json
├── [✓] pnpm-workspace.yaml
├── [✓] tsconfig.json
└── [✓] vitest.workspace.ts
```

---

## .changeset/README.md

```markdown
# Changesets

Hello and welcome! This folder has been automatically generated by `@changesets/cli`, a build tool that works
with multi-package repos, or single-package repos to help you version and publish your code. You can
find the full documentation for it [in our repository](https://github.com/changesets/changesets)

We have a quick list of common questions to get you started engaging with this project in
[our documentation](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)

```

---

## .changeset/config.json

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}

```

---

## .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build Packages
        run: pnpm build

      - name: Run Tests
        run: pnpm test

      - name: Type Check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint


```

---

## .gitignore

```gitignore
node_modules
dist
.idea
.vscode
*.log
.DS_Store
playground/dist
coverage
*.tsbuildinfo

```

---

## .npmignore

```text
src/
tsconfig.json
.gitignore
*.log
.DS_Store
*.tsbuildinfo


```

---

## CONTRIBUTING.md

```markdown
# Contributing to Universal DevTools Kit

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 8+
- Git

### Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/u-devtools.git
   cd u-devtools
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Build all packages**
   ```bash
   pnpm build
   ```

5. **Run the playground**
   ```bash
   cd playground
   pnpm dev
   ```

## Development Workflow

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Run tests:
   ```bash
   pnpm test
   ```

4. Run type checking:
   ```bash
   pnpm typecheck
   ```

5. Run linting:
   ```bash
   pnpm lint
   ```

6. Format code:
   ```bash
   pnpm format
   ```

### Creating a Plugin

See the [Plugin Development Guide](../README.md#-plugin-development-guide) in the main README.

### Testing

We use Vitest for testing. Tests are located in `packages/*/test/` directories.

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

## Submitting Changes

1. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

2. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

3. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit

## Code Style

- We use Biome for formatting and linting
- TypeScript strict mode is enabled
- Follow the existing code style
- Use meaningful variable and function names

## Project Structure

```
u-devtools/
├── packages/
│   ├── core/          # Core types and utilities
│   ├── bridge/        # RPC communication
│   ├── vite/          # Vite plugin
│   ├── client/        # DevTools Shell UI
│   └── ui/            # UI component library
├── plugins/
│   ├── i18n/          # i18n plugin
│   ├── network/       # Network plugin
│   └── inspector/     # Inspector plugin
└── playground/        # Test application
```

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.


```

---

## LICENSE

```text
MIT License

Copyright (c) 2024 Universal DevTools Kit Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


```

---

## README.md

```markdown
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

```

---

## biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.10/schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "overrides": [
    {
      "includes": ["**/*.ts", "**/*.tsx"],
      "linter": {
        "rules": {
          "recommended": true
        }
      }
    }
  ],
  "files": {
    "includes": ["**", "!**/node_modules", "!**/dist", "!**/*.log"]
  }
}

```

---

## package.json

```json
{
  "name": "u-devtools",
  "version": "0.1.0",
  "description": "Universal DevTools Kit - DevTools-as-a-Service framework",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r --parallel run dev",
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "typecheck": "pnpm -r run typecheck",
    "test": "vitest run",
    "test:watch": "vitest",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish",
    "check": "pnpm run typecheck && pnpm run lint && pnpm run format:check",
    "prepublishOnly": "pnpm run check && pnpm run test && pnpm run build"
  },
  "keywords": [
    "devtools",
    "debugging",
    "vite",
    "plugin"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@biomejs/biome": "^2.3.10",
    "@changesets/cli": "^2.29.8",
    "@unocss/preset-icons": "^66.5.11",
    "@vitest/ui": "^4.0.16",
    "@vueuse/core": "^14.1.0",
    "tsup": "^8.5.1",
    "typescript": "^5.3.3",
    "unocss": "^66.5.11",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.16"
  },
  "pnpm": {
    "overrides": {
      "typescript": "^5.3.3"
    }
  }
}

```

---

## packages/bridge/package.json

```json
{
  "name": "@u-devtools/bridge",
  "version": "0.1.0",
  "description": "RPC bridge for Universal DevTools communication",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.0"
  }
}

```

---

## packages/bridge/src/index.ts

```typescript
import type { RpcMessage } from '@u-devtools/core';

// Генератор ID
const uuid = () => Math.random().toString(36).substring(2, 15);

/**
 * КЛИЕНТСКАЯ ЧАСТЬ (Браузер)
 * Работает через import.meta.hot
 */
export class ViteRpcClient {
  private handlers = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  private eventListeners = new Map<string, Set<(data: unknown) => void>>();

  constructor(
    private hot: {
      send: (event: string, data: unknown) => void;
      on: (event: string, handler: (data: unknown) => void) => void;
    }
  ) {
    if (!hot) throw new Error('Hot Module Replacement is required for DevTools');

    // Слушаем ответы от сервера
    hot.on('u-devtools:response', (data: unknown) => {
      const msg = data as RpcMessage;
      const handler = this.handlers.get(msg.id);
      if (handler) {
        if (msg.error) {
          handler.reject(new Error(String(msg.error)));
        } else {
          handler.resolve(msg.payload);
        }
        this.handlers.delete(msg.id);
      }
    });

    // Слушаем события от сервера (push notifications)
    hot.on('u-devtools:event', (data: unknown) => {
      const msg = data as RpcMessage;
      const listeners = this.eventListeners.get(msg.method || '');
      if (listeners) {
        for (const fn of listeners) {
          fn(msg.payload);
        }
      }
    });
  }

  // Вызов метода на сервере
  call<T = unknown>(method: string, payload?: unknown): Promise<T> {
    const id = uuid();
    return new Promise<T>((resolve, reject) => {
      this.handlers.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      // Отправляем запрос через нативный канал Vite
      this.hot.send('u-devtools:request', { id, method, payload });

      // Таймаут на всякий случай
      setTimeout(() => {
        if (this.handlers.has(id)) {
          this.handlers.delete(id);
          reject(new Error(`RPC Timeout: ${method}`));
        }
      }, 5000);
    });
  }

  // Подписка на события
  on(event: string, fn: (data: unknown) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(fn);
  }
}

/**
 * СЕРВЕРНАЯ ЧАСТЬ (Node.js)
 * Работает через server.ws
 */
export class ViteRpcServer {
  private methods = new Map<string, (payload: unknown) => Promise<unknown> | unknown>();

  constructor(
    private ws: {
      on: (
        event: string,
        handler: (data: unknown, client: { send: (event: string, data: unknown) => void }) => void
      ) => void;
      send: (event: string, data: unknown) => void;
    }
  ) {
    // Слушаем запросы от клиента
    ws.on(
      'u-devtools:request',
      async (data: unknown, client: { send: (event: string, data: unknown) => void }) => {
        const msg = data as RpcMessage;
        const { id, method, payload } = msg;

        try {
          const fn = this.methods.get(method || '');
          if (!fn) throw new Error(`Method ${method} not found`);

          const result = await fn(payload);

          // Отправляем ответ конкретному клиенту
          client.send('u-devtools:response', {
            id,
            type: 'response',
            payload: result,
          });
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          client.send('u-devtools:response', {
            id,
            type: 'response',
            error,
          });
        }
      }
    );
  }

  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown) {
    this.methods.set(method, fn);
  }

  broadcast(event: string, payload?: unknown) {
    this.ws.send('u-devtools:event', {
      type: 'event',
      method: event,
      payload,
    });
  }
}

```

---

## packages/bridge/test/rpc.test.ts

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ViteRpcClient, ViteRpcServer } from '../src/index';

class MockTransport {
  listeners = new Map<string, Function>();
  peer?: MockTransport;

  on(event: string, fn: Function) {
    this.listeners.set(event, fn);
  }

  send(event: string, data: unknown) {
    process.nextTick(() => {
      if (this.peer) {
        const handler = this.peer.listeners.get(event);
        if (handler) {
          handler(data, {
            send: (evt: string, payload: unknown) => {
              process.nextTick(() => {
                this.receive(evt, payload);
              });
            },
          });
        }
      }
    });
  }

  receive(event: string, data: unknown) {
    const handler = this.listeners.get(event);
    if (handler) {
      handler(data);
    }
  }
}

describe('RPC Bridge', () => {
  it('should handle request-response cycle', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();

    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as { send: Function; on: Function }
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as { on: Function; send: Function }
    );

    server.handle('math:add', ({ a, b }: { a: number; b: number }) => {
      return a + b;
    });

    const result = await client.call('math:add', { a: 5, b: 3 });

    expect(result).toBe(8);
  });

  it('should handle errors', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();
    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as { send: Function; on: Function }
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as { on: Function; send: Function }
    );

    server.handle('error:throw', () => {
      throw new Error('Something went wrong');
    });

    await expect(client.call('error:throw')).rejects.toThrow('Something went wrong');
  });

  it('should handle events', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();
    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as { send: Function; on: Function }
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as { on: Function; send: Function }
    );

    const events: unknown[] = [];

    client.on('test:event', (data) => {
      events.push(data);
    });

    server.broadcast('test:event', { message: 'Hello' });

    await new Promise((resolve) => process.nextTick(resolve));

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ message: 'Hello' });
  });
});

```

---

## packages/bridge/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/bridge/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['vite'],
});

```

---

## packages/bridge/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});

```

---

## packages/client/package.json

```json
{
  "name": "@u-devtools/client",
  "version": "0.1.0",
  "description": "Client-side UI shell for Universal DevTools",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "vue-tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/bridge": "workspace:*",
    "@u-devtools/ui": "workspace:*",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@unocss/preset-icons": "^66.5.11",
    "typescript": "^5.3.3",
    "unocss": "^66.5.11",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  }
}

```

---

## packages/client/src/App.vue

```vue
<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted, watch } from 'vue';
import { useDark } from '@vueuse/core';
import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { plugins as rawPlugins } from 'virtual:u-devtools-plugins';
import PluginRenderer from './components/PluginRenderer.vue';
import { useNotifications } from './composables/useNotifications';
import { useSettings } from './composables/useSettings';
import { createPluginStorage } from './composables/usePluginStorage';
import CommandPalette from './components/CommandPalette.vue';
import { UInput, UButton } from '@u-devtools/ui';

if (!import.meta.hot) {
  throw new Error('Vite HMR is required for DevTools');
}

const rpc = new ViteRpcClient(import.meta.hot);
const { notifications, notify } = useNotifications();
const { getSetting, saveSetting } = useSettings();

const api: ClientApi = {
  rpc,
  notify,
};

const plugins = shallowRef<PluginClientInstance[]>(rawPlugins);
const activePluginId = ref<string>(plugins.value[0]?.name || '');
const showSettings = ref(false);
const isPaletteOpen = ref(false);

const isDark = useDark({
  storageKey: 'u-devtools-theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

const currentPlugin = computed(() => plugins.value.find((p) => p.name === activePluginId.value));

const createApiForPlugin = (pluginName: string): ClientApi => ({
  rpc,
  notify,
  storage: createPluginStorage(pluginName),
});

plugins.value.forEach((plugin) => {
  if (plugin.setup) {
    plugin.setup(createApiForPlugin(plugin.name));
  }
});

const openSettings = () => {
  showSettings.value = true;
};

const onKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isPaletteOpen.value = !isPaletteOpen.value;
  }
  if (e.key === 'Escape' && isPaletteOpen.value) {
    isPaletteOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div class="flex h-screen w-screen bg-white text-gray-800 font-sans overflow-hidden udt-reset">
    <!-- A. Activity Bar (Left) -->
    <div
      class="w-12 flex-none bg-gray-900 flex flex-col items-center py-4 gap-4 border-r border-gray-800 z-10"
    >
      <button
        v-for="p in plugins"
        :key="p.name"
        @click="activePluginId = p.name"
        :title="p.name"
        class="w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
        :class="[
          activePluginId === p.name
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'text-gray-400 hover:text-white hover:bg-gray-800',
        ]"
      >
        <div :class="[p.icon, 'text-xl']" />
      </button>

      <!-- Settings & Theme Toggle -->
      <div class="mt-auto flex flex-col items-center pb-4 gap-4">
        <button
          @click="isDark = !isDark"
          class="text-gray-400 hover:text-white transition"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <div :class="isDark ? 'i-carbon-sun' : 'i-carbon-moon'" class="text-xl" />
        </button>
        <button
          @click="openSettings"
          class="text-gray-400 hover:text-white transition"
          title="Settings"
        >
          <div class="i-carbon-settings text-xl" />
        </button>
      </div>
    </div>

    <!-- B. Sidebar (Optional) -->
    <div
      v-if="currentPlugin?.renderSidebar"
      class="w-64 flex-none border-r border-gray-200 bg-gray-50 flex flex-col"
    >
      <div
        class="h-10 border-b flex items-center px-4 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-gray-100"
      >
        {{ currentPlugin.name }}
      </div>
      <div class="flex-1 overflow-hidden relative">
        <PluginRenderer :renderer="currentPlugin.renderSidebar" :api="api" />
      </div>
    </div>

    <!-- C. Main View -->
    <div class="flex-1 flex flex-col min-w-0 bg-white relative z-0">
      <div v-if="currentPlugin" class="flex-1 overflow-hidden relative">
        <PluginRenderer
          :renderer="currentPlugin.renderMain"
          :api="createApiForPlugin(currentPlugin.name)"
        />
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-300 flex-col gap-2">
        <div class="i-carbon-cube text-4xl" />
        <p>Select a plugin to start</p>
      </div>
    </div>

    <!-- D. Notifications Toast -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="px-4 py-2 rounded shadow-lg text-sm text-white transform transition-all animate-fade-in-up pointer-events-auto"
        :class="{
          'bg-gray-800': n.type === 'info',
          'bg-red-600': n.type === 'error',
          'bg-green-600': n.type === 'success',
        }"
      >
        {{ n.message }}
      </div>
    </div>

    <!-- E. Settings Modal -->
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="showSettings = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div class="p-4 border-b font-bold text-lg flex justify-between items-center">
          <span>Settings</span>
          <button
            @click="showSettings = false"
            class="i-carbon-close text-gray-500 hover:text-black transition"
          />
        </div>
        <div class="p-6 overflow-auto">
          <div v-for="plugin in plugins" :key="plugin.name" class="mb-8">
            <div v-if="plugin.settings" class="mb-4">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <div :class="plugin.icon" />
                <span>{{ plugin.name }}</span>
              </h3>

              <div class="space-y-4 pl-4 border-l-2 border-gray-100">
                <div v-for="(schema, key) in plugin.settings" :key="key">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ schema.label }}</label>

                  <UInput
                    v-if="schema.type === 'string'"
                    :model-value="getSetting(plugin.name, key, schema.default)"
                    @update:model-value="(val) => saveSetting(plugin.name, key, val)"
                  />

                  <label
                    v-if="schema.type === 'boolean'"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :checked="getSetting(plugin.name, key, schema.default)"
                      @change="
                        (e) =>
                          saveSetting(
                            plugin.name,
                            key,
                            (e.target as HTMLInputElement).checked
                          )
                      "
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm text-gray-600">Enabled</span>
                  </label>

                  <select
                    v-if="schema.type === 'select'"
                    :value="getSetting(plugin.name, key, schema.default)"
                    @change="
                      (e) => saveSetting(plugin.name, key, (e.target as HTMLSelectElement).value)
                    "
                    class="border rounded px-2 py-1 w-full"
                  >
                    <option v-for="opt in schema.options" :key="String(opt.value)" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- F. Command Palette -->
    <CommandPalette
      v-if="isPaletteOpen"
      :visible="isPaletteOpen"
      :plugins="plugins"
      @close="isPaletteOpen = false"
    />
  </div>
</template>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.2s ease-out;
}
</style>

```

---

## packages/client/src/components/CommandPalette.vue

```vue
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import type { PluginCommand, PluginClientInstance } from '@u-devtools/core';

const props = defineProps<{
  visible: boolean;
  plugins: PluginClientInstance[];
}>();

const emit = defineEmits<{
  close: [];
  execute: [command: PluginCommand];
}>();

const search = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

const allCommands = computed(() => {
  const list: (PluginCommand & { pluginName: string })[] = [];
  props.plugins.forEach((p) => {
    if (p.commands) {
      p.commands.forEach((c) => {
        list.push({ ...c, pluginName: p.name });
      });
    }
  });
  return list;
});

const filteredCommands = computed(() => {
  const q = search.value.toLowerCase();
  return allCommands.value.filter(
    (c) => c.label.toLowerCase().includes(q) || c.pluginName.toLowerCase().includes(q)
  );
});

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value =
      (selectedIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const cmd = filteredCommands.value[selectedIndex.value];
    if (cmd) {
      execute(cmd);
    }
  }
};

const execute = (cmd: PluginCommand) => {
  cmd.action();
  emit('execute', cmd);
  emit('close');
};

onMounted(() => {
  nextTick(() => {
    const input = inputRef.value as unknown as HTMLInputElement;
    if (input) {
      input.focus();
    }
  });
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    <div
      class="relative w-[500px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-fade-in"
    >
      <div class="p-3 border-b">
        <div class="relative">
          <div class="absolute left-3 top-2.5 text-gray-400 i-carbon-search text-lg" />
          <input
            ref="inputRef"
            v-model="search"
            class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a command..."
            @keydown="onKeydown"
          />
        </div>
      </div>

      <div class="overflow-y-auto flex-1 p-2">
        <div
          v-for="(cmd, idx) in filteredCommands"
          :key="cmd.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors"
          :class="
            idx === selectedIndex
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          "
          @click="execute(cmd)"
          @mousemove="selectedIndex = idx"
        >
          <div :class="[cmd.icon || 'i-carbon-terminal', 'text-lg opacity-70']" />
          <div class="flex-1">
            <div class="font-medium text-sm">{{ cmd.label }}</div>
            <div class="text-[10px] opacity-60 uppercase tracking-wider">{{ cmd.pluginName }}</div>
          </div>
          <div v-if="cmd.shortcut" class="flex gap-1">
            <span
              v-for="k in cmd.shortcut"
              :key="k"
              class="bg-white/20 px-1.5 rounded text-xs font-mono"
            >
              {{ k }}
            </span>
          </div>
        </div>

        <div v-if="filteredCommands.length === 0" class="p-8 text-center text-gray-400">
          No commands found
        </div>
      </div>

      <div class="bg-gray-50 border-t px-3 py-1.5 text-xs text-gray-400 flex justify-between">
        <span>Arguments are not supported yet</span>
        <div class="flex gap-2">
          <span>⇅ Navigate</span>
          <span>↵ Select</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>


```

---

## packages/client/src/components/PluginRenderer.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, onErrorCaptured } from 'vue';
import type { ClientApi, UnmountFn } from '@u-devtools/core';

const props = defineProps<{
  api: ClientApi;
  renderer?: (el: HTMLElement, api: ClientApi) => UnmountFn | void;
}>();

const container = ref<HTMLElement | null>(null);
const error = ref<Error | null>(null);
let cleanup: UnmountFn | undefined | void;

const mount = () => {
  error.value = null;

  if (cleanup && typeof cleanup === 'function') {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    cleanup = undefined;
  }

  if (!container.value) return;
  container.value.innerHTML = '';

  if (props.renderer) {
    try {
      cleanup = props.renderer(container.value, props.api);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      error.value = err;
      console.error('Plugin render error:', err);
      if (container.value) {
        container.value.innerHTML = `
          <div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div class="flex items-center gap-2 mb-2">
              <div class="i-carbon-warning text-red-600 dark:text-red-400" />
              <h3 class="font-semibold text-red-800 dark:text-red-200">Plugin Error</h3>
            </div>
            <p class="text-sm text-red-700 dark:text-red-300">${err.message}</p>
            <details class="mt-2">
              <summary class="text-xs text-red-600 dark:text-red-400 cursor-pointer">Stack trace</summary>
              <pre class="mt-1 text-xs text-red-600 dark:text-red-400 font-mono">${err.stack || 'No stack trace available'}</pre>
            </details>
          </div>
        `;
      }
    }
  }
};

onErrorCaptured((err) => {
  error.value = err;
  console.error('Plugin error captured:', err);
  if (container.value && !container.value.innerHTML.includes('Plugin Error')) {
    container.value.innerHTML = `
      <div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <div class="flex items-center gap-2 mb-2">
          <div class="i-carbon-warning text-red-600 dark:text-red-400" />
          <h3 class="font-semibold text-red-800 dark:text-red-200">Plugin Crashed</h3>
        </div>
        <p class="text-sm text-red-700 dark:text-red-300">${err.message}</p>
      </div>
    `;
  }
  return false;
});

watch(() => props.renderer, mount);

onMounted(mount);

onBeforeUnmount(() => {
  if (cleanup && typeof cleanup === 'function') {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during unmount cleanup:', e);
    }
  }
});
</script>

<template>
  <div ref="container" class="h-full w-full overflow-auto relative">
    <!-- Плагин будет рендериться сюда -->
  </div>
</template>

```

---

## packages/client/src/composables/useNotifications.ts

```typescript
import { ref } from 'vue';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

const notifications = ref<Notification[]>([]);
let counter = 0;

export function useNotifications() {
  const notify = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = counter++;
    notifications.value.push({ id, message, type });

    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id);
    }, 3000);
  };

  return {
    notifications,
    notify,
  };
}

```

---

## packages/client/src/composables/usePluginStorage.ts

```typescript
import type { StorageApi } from '@u-devtools/core';
import { reactive, watch } from 'vue';

const storageState = reactive<Record<string, unknown>>({});

try {
  const raw = localStorage.getItem('u-devtools-storage');
  if (raw) {
    Object.assign(storageState, JSON.parse(raw));
  }
} catch {
  // Ignore
}

watch(
  storageState,
  () => {
    localStorage.setItem('u-devtools-storage', JSON.stringify(storageState));
  },
  { deep: true }
);

export function createPluginStorage(pluginName: string): StorageApi {
  const prefix = `${pluginName}:`;

  return {
    get<T>(key: string, def: T): T {
      const val = storageState[prefix + key];
      return val === undefined ? def : val;
    },
    set<T>(key: string, value: T) {
      storageState[prefix + key] = value;
    },
    remove(key: string) {
      delete storageState[prefix + key];
    },
  };
}

```

---

## packages/client/src/composables/useSettings.ts

```typescript
import { reactive, watch } from 'vue';

const settingsState = reactive<Record<string, unknown>>({});

try {
  const saved = localStorage.getItem('u-devtools-settings');
  if (saved) {
    Object.assign(settingsState, JSON.parse(saved));
  }
} catch (e) {
  // Ignore
}

watch(
  settingsState,
  () => {
    localStorage.setItem('u-devtools-settings', JSON.stringify(settingsState));
  },
  { deep: true }
);

export function useSettings() {
  const getSetting = (plugin: string, key: string, def: unknown) => {
    return settingsState[`${plugin}:${key}`] ?? def;
  };

  const saveSetting = (plugin: string, key: string, val: unknown) => {
    settingsState[`${plugin}:${key}`] = val;
  };

  return { getSetting, saveSetting, settingsState };
}

```

---

## packages/client/src/main.ts

```typescript
import { createApp } from 'vue';
import App from './App.vue';

import '@u-devtools/ui/style.css';
import 'virtual:uno.css';

const app = createApp(App);
app.mount('#app');

```

---

## packages/client/src/style.css

```css
:root {
  --udt-bg: #ffffff;
  --udt-bg-soft: #f9fafb;
  --udt-border: #e5e7eb;
  --udt-text: #111827;
  --udt-text-dim: #6b7280;
  --udt-primary: #4f46e5;
  --udt-primary-hover: #4338ca;
  --udt-radius: 0.375rem;
}

/* Утилиты для плагинов */
.udt-btn {
  padding: 0.25rem 0.75rem;
  border-radius: var(--udt-radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.udt-btn-primary {
  background: var(--udt-primary);
  color: white;
}

.udt-btn-primary:hover {
  background: var(--udt-primary-hover);
}

.udt-btn-secondary {
  background: var(--udt-bg-soft);
  color: var(--udt-text);
  border: 1px solid var(--udt-border);
}

.udt-btn-secondary:hover {
  background: var(--udt-border);
}

.udt-input {
  width: 100%;
  border: 1px solid var(--udt-border);
  border-radius: var(--udt-radius);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  background: var(--udt-bg);
  color: var(--udt-text);
}

.udt-input:focus {
  outline: none;
  border-color: var(--udt-primary);
  ring: 2px;
  ring-color: var(--udt-primary);
}

.udt-card {
  background: var(--udt-bg);
  border: 1px solid var(--udt-border);
  border-radius: var(--udt-radius);
  padding: 1rem;
}

.udt-text {
  color: var(--udt-text);
}

.udt-text-dim {
  color: var(--udt-text-dim);
}

```

---

## packages/client/src/vite-env.d.ts

```typescript
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

```

---

## packages/client/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["vite/client"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/client/uno.config.ts

```typescript
import { defineConfig, presetUno, presetIcons } from 'unocss';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  content: {
    pipeline: {
      include: ['src/**/*.{vue,ts}', resolve(__dirname, '../../packages/ui/src/**/*.{vue,ts}')],
    },
  },
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'icon-btn': 'op50 hover:op100 transition cursor-pointer',
  },
});

```

---

## packages/client/vite.config.ts

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'DevToolsClient',
      fileName: 'main',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'virtual:u-devtools-plugins'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});

```

---

## packages/core/package.json

```json
{
  "name": "@u-devtools/core",
  "version": "0.1.0",
  "description": "Core types and interfaces for Universal DevTools",
  "keywords": [
    "devtools",
    "types",
    "core"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/u-devtools.git",
    "directory": "packages/core"
  },
  "publishConfig": {
    "access": "public"
  },
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vite-plugin-dts": "^4.5.4"
  }
}

```

---

## packages/core/src/index.ts

```typescript
// --- RPC Interfaces ---
export interface RpcMessage<T = unknown> {
  id: string;
  type: 'request' | 'response' | 'event';
  method?: string;
  payload?: T;
  error?: unknown;
}

export interface RpcClientInterface {
  call<T = unknown>(method: string, payload?: unknown): Promise<T>;
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback: (data: unknown) => void): void;
}

export interface PluginCommand {
  id: string;
  label: string;
  icon?: string;
  action: () => void | Promise<void>;
  shortcut?: string[];
}

export interface StorageApi {
  get<T>(key: string, def: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

export interface ClientApi {
  rpc: RpcClientInterface;
  notify: (msg: string, type?: 'info' | 'error' | 'success') => void;
  storage: StorageApi;
}

// --- Plugin Interfaces ---
export type UnmountFn = () => void;

export interface PluginSettingsSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'select';
    label: string;
    default?: unknown;
    options?: { label: string; value: unknown }[];
  };
}

export interface PluginClientInstance {
  name: string;
  icon: string;

  settings?: PluginSettingsSchema;
  commands?: PluginCommand[];

  renderSidebar?: (el: HTMLElement, api: ClientApi) => UnmountFn;
  renderMain?: (el: HTMLElement, api: ClientApi) => UnmountFn;
}

export interface ServerContext {
  root: string;
  server: unknown;
}

export interface RpcServerInterface {
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;
  broadcast(event: string, payload?: unknown): void;
}

export interface DevToolsPlugin {
  name: string;
  clientPath?: string;
  appPath?: string;
  setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
}

export interface InspectorEvent {
  type: 'element-selected';
  data: {
    tagName: string;
    attrs: Record<string, string>;
    rect: { x: number; y: number; width: number; height: number };
  };
}

export { safeResolve } from './utils/path';

```

---

## packages/core/src/utils/path.ts

```typescript
import path from 'node:path';

/**
 * Safely resolves a file path relative to a root directory.
 * Throws an error if the resolved path is outside the root directory.
 *
 * @param root - The root directory path
 * @param targetPath - The target path (relative or absolute)
 * @returns The resolved absolute path
 * @throws Error if the path is outside the root directory
 */
export function safeResolve(root: string, targetPath: string): string {
  const normalizedRoot = path.resolve(root);
  const resolvedPath = path.resolve(root, targetPath);

  if (!resolvedPath.startsWith(normalizedRoot)) {
    throw new Error(`Access denied: Path is outside project root`);
  }
  return resolvedPath;
}

```

---

## packages/core/tmp/cache/vite/last-build-production.json

```json
{
  "success": false,
  "errors": "▲ [WARNING] The condition \"types\" here will never be used as it comes after both \"import\" and \"require\" [package.json]\n\n    package.json:12:6:\n      12 │       \"types\": \"./dist/index.d.ts\"\n         ╵       ~~~~~~~\n\n  The \"import\" condition comes earlier and will be used for all \"import\" statements:\n\n    package.json:10:6:\n      10 │       \"import\": \"./dist/index.es.js\",\n         ╵       ~~~~~~~~\n\n  The \"require\" condition comes earlier and will be used for all \"require\" calls:\n\n    package.json:11:6:\n      11 │       \"require\": \"./dist/index.cjs.js\",\n         ╵       ~~~~~~~~~\n\nfailed to load config from /Users/s00d/Downloads/vite-devtools/packages/core/vite.config.ts\nerror during build:\nError [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /Users/s00d/Downloads/vite-devtools/packages/core/node_modules/.vite-temp/vite.config.ts.timestamp-1766900912041-ee7779ca24135.mjs\n    at packageResolve (node:internal/modules/esm/resolve:873:9)\n    at moduleResolve (node:internal/modules/esm/resolve:946:18)\n    at defaultResolve (node:internal/modules/esm/resolve:1188:11)\n    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:642:12)\n    at #cachedDefaultResolve (node:internal/modules/esm/loader:591:25)\n    at ModuleLoader.resolve (node:internal/modules/esm/loader:574:38)\n    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:236:38)\n    at ModuleJob._link (node:internal/modules/esm/module_job:130:49)\n",
  "timestamp": "2025-12-28 10:48:32",
  "vite_ruby": "3.8.0",
  "digest": "7de3c3595795bab924c6db984e9371a3f587652f"
}

```

---

## packages/core/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/core/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: [],
});

```

---

## packages/core/vite.config.ts

```typescript
import { createViteConfig } from '../../shared/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsCore',
  entry: 'src/index.ts',
  dir: __dirname,
});

```

---

## packages/kit/package.json

```json
{
  "name": "@u-devtools/kit",
  "version": "0.1.0",
  "description": "SDK for creating Universal DevTools plugins",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/bridge": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}

```

---

## packages/kit/src/index.ts

```typescript
export * from '@u-devtools/core';
export * from '@u-devtools/bridge';

```

---

## packages/kit/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/ui/package.json

```json
{
  "name": "@u-devtools/ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./src/style.css"
  },
  "files": [
    "dist",
    "src/style.css"
  ],
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "vue-tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vue": "^3.4.0",
    "vue-tsc": "^2.0.0"
  }
}

```

---

## packages/ui/src/components/UBadge.vue

```vue
<script setup lang="ts">
defineProps<{
  color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue';
  label?: string | number;
}>();
</script>

<template>
  <span
    class="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center justify-center"
    :class="{
      'bg-gray-100 text-gray-700': !color || color === 'gray',
      'bg-red-100 text-red-700': color === 'red',
      'bg-green-100 text-green-700': color === 'green',
      'bg-yellow-100 text-yellow-800': color === 'yellow',
      'bg-blue-100 text-blue-700': color === 'blue',
    }"
  >
    <slot>{{ label }}</slot>
  </span>
</template>


```

---

## packages/ui/src/components/UButton.vue

```vue
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: string;
  loading?: boolean;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    class="flex items-center justify-center gap-2 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      variant === 'primary'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : variant === 'ghost'
          ? 'bg-transparent text-gray-600 hover:bg-gray-100'
          : variant === 'danger'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="i-carbon-circle-dash animate-spin" />
    <div v-else-if="icon" :class="icon" />
    <slot />
  </button>
</template>

```

---

## packages/ui/src/components/UCodeBlock.vue

```vue
<script setup lang="ts">
defineProps<{
  language?: string;
}>();
</script>

<template>
  <div class="relative group bg-gray-900 rounded-md overflow-hidden text-gray-100 font-mono text-sm">
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
      <slot name="actions" />
    </div>
    <pre class="whitespace-pre-wrap break-all p-4"><slot /></pre>
  </div>
</template>


```

---

## packages/ui/src/components/UIcon.vue

```vue
<script setup lang="ts">
defineProps<{
  name: string;
  size?: string;
}>();
</script>

<template>
  <div :class="name" :style="{ fontSize: size }" class="inline-block" />
</template>

```

---

## packages/ui/src/components/UInput.vue

```vue
<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

```

---

## packages/ui/src/components/USelect.vue

```vue
<script setup lang="ts">
interface Option {
  label: string;
  value: string;
}

defineProps<{
  modelValue?: string;
  options?: Option[];
  placeholder?: string;
  size?: 'sm' | 'md';
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <select
    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
    :class="size === 'sm' ? 'text-xs py-1' : ''"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

```

---

## packages/ui/src/components/UTable.vue

```vue
<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[];
  rows: unknown[];
}>();
</script>

<template>
  <div class="w-full overflow-auto border border-gray-200 rounded">
    <table class="w-full text-left text-sm whitespace-nowrap">
      <thead class="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
        <tr>
          <th v-for="col in columns" :key="col.key" class="px-4 py-2" :style="{ width: col.width }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-for="(row, idx) in rows" :key="idx" class="hover:bg-gray-50 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-4 py-2">
            <slot :name="`cell-${col.key}`" :row="row" :val="(row as Record<string, unknown>)[col.key]">
              {{ (row as Record<string, unknown>)[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


```

---

## packages/ui/src/index.ts

```typescript
import './style.css';

export { default as UButton } from './components/UButton.vue';
export { default as UIcon } from './components/UIcon.vue';
export { default as UInput } from './components/UInput.vue';
export { default as USelect } from './components/USelect.vue';
export { default as UCodeBlock } from './components/UCodeBlock.vue';
export { default as UBadge } from './components/UBadge.vue';
export { default as UTable } from './components/UTable.vue';

```

---

## packages/ui/src/style.css

```css
:root {
  --udt-c-primary: #6366f1;
  --udt-c-primary-hover: #4f46e5;
  --udt-bg: #ffffff;
  --udt-bg-soft: #f9fafb;
  --udt-border: #e5e7eb;
  --udt-text: #1f2937;
  --udt-text-dim: #6b7280;
  --udt-radius: 4px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}

html.dark {
  --udt-bg: #111827;
  --udt-bg-soft: #1f2937;
  --udt-border: #374151;
  --udt-text: #f9fafb;
  --udt-text-dim: #9ca3af;
}

body {
  background-color: var(--udt-bg);
  color: var(--udt-text);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.udt-reset * {
  box-sizing: border-box;
}

```

---

## packages/ui/src/styles/main.css

```css
:root {
  --udt-bg: #ffffff;
  --udt-bg-soft: #f9fafb;
  --udt-border: #e5e7eb;
  --udt-text: #111827;
  --udt-text-dim: #6b7280;
  --udt-primary: #4f46e5;
  --udt-primary-hover: #4338ca;
  --udt-radius: 0.375rem;
}

/* Утилиты для плагинов */
.udt-btn {
  padding: 0.25rem 0.75rem;
  border-radius: var(--udt-radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.udt-btn:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--udt-primary);
}

.udt-btn-primary {
  background: var(--udt-primary);
  color: white;
}

.udt-btn-primary:hover {
  background: var(--udt-primary-hover);
}

.udt-btn-secondary {
  background: var(--udt-bg-soft);
  color: var(--udt-text);
  border: 1px solid var(--udt-border);
}

.udt-btn-secondary:hover {
  background: var(--udt-border);
}

.udt-btn-ghost {
  background: transparent;
  color: var(--udt-text);
}

.udt-btn-ghost:hover {
  background: var(--udt-bg-soft);
}

.udt-btn-danger {
  background: #ef4444;
  color: white;
}

.udt-btn-danger:hover {
  background: #dc2626;
}

.udt-btn-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.udt-btn-md {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.udt-btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.udt-input {
  width: 100%;
  border: 1px solid var(--udt-border);
  border-radius: var(--udt-radius);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  background: var(--udt-bg);
  color: var(--udt-text);
}

.udt-input:focus {
  outline: none;
  border-color: var(--udt-primary);
  ring: 2px;
  ring-color: var(--udt-primary);
}

.udt-card {
  background: var(--udt-bg);
  border: 1px solid var(--udt-border);
  border-radius: var(--udt-radius);
  padding: 1rem;
}

.udt-text {
  color: var(--udt-text);
}

.udt-text-dim {
  color: var(--udt-text-dim);
}

```

---

## packages/ui/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["vite/client"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/ui/vite.config.ts

```typescript
import { createViteConfig } from '../../shared/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsUI',
  entry: 'src/index.ts',
  dir: __dirname,
});

```

---

## packages/vite/package.json

```json
{
  "name": "@u-devtools/vite",
  "version": "0.1.0",
  "description": "Universal DevTools Kit for Vite applications",
  "keywords": [
    "vite",
    "devtools",
    "plugin",
    "dx",
    "debug"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/u-devtools.git",
    "directory": "packages/vite"
  },
  "publishConfig": {
    "access": "public"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/bridge": "workspace:*",
    "launch-editor": "^2.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3",
    "tsup": "^8.5.1"
  }
}

```

---

## packages/vite/src/index.ts

```typescript
import type { PluginOption, ViteDevServer } from 'vite';
import { ViteRpcServer } from '@u-devtools/bridge';
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Идентификатор виртуального модуля
const VIRTUAL_MODULE_ID = 'virtual:u-devtools-plugins';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const VIRTUAL_APP_ID = 'virtual:u-devtools-app';
const RESOLVED_APP_ID = `\0${VIRTUAL_APP_ID}`;

// Путь к пакету клиента внутри node_modules
// Предполагаем структуру: node_modules/@u-devtools/vite/dist/index.js -> node_modules/@u-devtools/client/
const CLIENT_ROOT = path.resolve(__dirname, '../../client');

export interface DevToolsOptions {
  base?: string;
  plugins?: DevToolsPlugin[];
}

export function createDevTools(options: DevToolsOptions = {}): PluginOption {
  const plugins = options.plugins || [];
  let rpcServer: ViteRpcServer;
  const base = options.base || '/__devtools';

  return {
    name: 'u-devtools',
    apply: 'serve',

    config() {
      return {
        resolve: {
          alias: {
            '@u-devtools/client': CLIENT_ROOT,
          },
        },
        server: {
          fs: {
            allow: [CLIENT_ROOT],
          },
        },
      };
    },

    // 1. Резолвим виртуальные модули
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      if (id === VIRTUAL_APP_ID) {
        return RESOLVED_APP_ID;
      }
      return null;
    },

    // 2. Генерируем код модуля, импортирующего клиентские части плагинов
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const clientPlugins = plugins.filter((p) => p.clientPath);

        if (clientPlugins.length === 0) {
          return 'export const plugins = []';
        }

        const imports = clientPlugins
          .map((p, i) => `import plugin${i} from '${p.clientPath}'`)
          .join('\n');

        const exports = `export const plugins = [${clientPlugins.map((_, i) => `plugin${i}`).join(', ')}]`;

        return `${imports}\n${exports}`;
      }

      if (id === RESOLVED_APP_ID) {
        const appPlugins = plugins.filter((p) => p.appPath);

        if (appPlugins.length === 0) {
          return '';
        }

        return appPlugins.map((p) => `import '${p.appPath}';`).join('\n');
      }

      return null;
    },

    configureServer(server: ViteDevServer) {
      rpcServer = new ViteRpcServer(server.ws);
      const ctx = { root: server.config.root, server };

      // Инициализация серверной части плагинов
      plugins.forEach((p) => {
        if (p.setupServer) {
          p.setupServer(rpcServer, ctx);
        }
      });

      // Системные методы
      rpcServer.handle('sys:getPlugins', () => {
        return plugins.map((p) => ({ name: p.name }));
      });

      // Open in Editor функция
      rpcServer.handle('sys:openFile', async (payload: unknown) => {
        const {
          file,
          line = 1,
          column = 1,
        } = payload as { file: string; line?: number; column?: number };
        const filePath = path.resolve(ctx.root, file);
        const open = (await import('launch-editor')).default;
        open(filePath, `:${line}:${column}`);
      });

      // 3. Обслуживание Shell (оболочки)
      server.middlewares.use(`${base}/index.html`, (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Universal DevTools</title>
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
              <div id="app"></div>
              <script type="module" src="/@fs/${path.join(CLIENT_ROOT, 'src/main.ts')}"></script>
            </body>
          </html>
        `);
      });
    },

    // 4. Инъекция кнопки и appPath скриптов
    transformIndexHtml(html) {
      const appPlugins = plugins.filter((p) => p.appPath);
      const appScript =
        appPlugins.length > 0 ? `<script type="module" src="${VIRTUAL_APP_ID}"></script>` : '';

      return `${html}
        ${appScript}
        <script>
          (function() {
            const btn = document.createElement('button');
            btn.innerHTML = '🛠';
            btn.setAttribute('aria-label', 'Open DevTools');
            btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;width:40px;height:40px;border-radius:50%;background:#222;color:#fff;border:none;cursor:move;box-shadow:0 2px 8px rgba(0,0,0,0.3);user-select:none;';
            
            let isDragging = false;
            let currentX = 0;
            let currentY = 0;
            let initialX = 0;
            let initialY = 0;
            
            btn.onmousedown = (e) => {
              if (e.button !== 0) return;
              isDragging = true;
              initialX = e.clientX - currentX;
              initialY = e.clientY - currentY;
              btn.style.cursor = 'grabbing';
            };
            
            document.onmousemove = (e) => {
              if (!isDragging) return;
              e.preventDefault();
              currentX = e.clientX - initialX;
              currentY = e.clientY - initialY;
              
              const maxX = window.innerWidth - btn.offsetWidth;
              const maxY = window.innerHeight - btn.offsetHeight;
              
              currentX = Math.max(0, Math.min(currentX, maxX));
              currentY = Math.max(0, Math.min(currentY, maxY));
              
              btn.style.right = 'auto';
              btn.style.bottom = 'auto';
              btn.style.left = currentX + 'px';
              btn.style.top = currentY + 'px';
            };
            
            document.onmouseup = () => {
              if (isDragging) {
                isDragging = false;
                btn.style.cursor = 'move';
              }
            };
            
            btn.onclick = (e) => {
              if (isDragging) {
                e.preventDefault();
                return;
              }
              const iframe = document.createElement('iframe');
              iframe.src = '${base}/index.html';
              iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:100000;border:none;background:white;';
              iframe.setAttribute('aria-label', 'DevTools');
              document.body.appendChild(iframe);
              
              const closeBtn = document.createElement('button');
              closeBtn.innerHTML = '✕';
              closeBtn.setAttribute('aria-label', 'Close DevTools');
              closeBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:100001;width:32px;height:32px;border-radius:50%;background:#ef4444;color:#fff;border:none;cursor:pointer;font-size:18px;line-height:1;';
              closeBtn.onclick = () => {
                iframe.remove();
                closeBtn.remove();
              };
              document.body.appendChild(closeBtn);
            };
            
            document.body.appendChild(btn);
          })();
        </script>
      `;
    },
  };
}

```

---

## packages/vite/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "types": ["node"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## packages/vite/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['vite', 'node:path', 'node:url', 'node:fs', 'node:fs/promises'],
});

```

---

## plugins/i18n/README.md

```markdown
# @u-devtools/plugin-i18n

Translation management plugin for Universal DevTools.

## Features

- Visual JSON editor
- Auto-save to disk
- "Open in Editor" support (jump to key location in VS Code)
- Persistent file selection (remembers last opened file)

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        i18nPlugin({
          dir: 'src/locales' // Path to your JSON files
        })
      ]
    })
  ]
});
```

## Options

- `dir` (string, required): Path to directory containing JSON translation files.

## Commands

- `i18n.refresh` - Refresh translations from disk

## License

MIT


```

---

## plugins/i18n/package.json

```json
{
  "name": "@u-devtools/plugin-i18n",
  "version": "0.1.0",
  "description": "i18n plugin for Universal DevTools",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/ui": "workspace:*",
    "json-to-ast": "^2.1.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3"
  }
}

```

---

## plugins/i18n/src/client.ts

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import I18nPanel from './ui/I18nPanel.vue';

const refreshSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'i18n',
  icon: 'i-carbon-translate',

  commands: [
    {
      id: 'i18n.refresh',
      label: 'Refresh Translations',
      icon: 'i-carbon-renew',
      action: () => {
        refreshSignal.value();
      },
    },
  ],

  renderMain(container, api) {
    const app = createApp(I18nPanel, {
      rpc: api.rpc,
      notify: api.notify,
      storage: api.storage,
      openFile: (file: string, line: number, column: number) =>
        api.rpc.call('sys:openFile', { file, line, column }),
      onRegisterRefresh: (fn: () => void) => {
        refreshSignal.value = fn;
      },
    });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

```

---

## plugins/i18n/src/index.ts

```typescript
import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientPath = path.resolve(__dirname, './client.ts');

export interface I18nPluginOptions {
  dir: string;
}

export const i18nPlugin = (options: I18nPluginOptions): DevToolsPlugin => ({
  name: 'i18n',
  clientPath,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx, options),
});

```

---

## plugins/i18n/src/json-to-ast.d.ts

```typescript
declare module 'json-to-ast' {
  export interface Location {
    start: { line: number; column: number };
    end: { line: number; column: number };
  }

  export interface ASTNode {
    type: 'Object' | 'Array' | 'Literal' | 'Property';
    loc: Location;
    children?: ASTNode[];
    key?: ASTNode & { value: string };
    value?: ASTNode;
  }

  function parse(json: string): ASTNode;
  export default parse;
}

```

---

## plugins/i18n/src/server.ts

```typescript
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { safeResolve } from '@u-devtools/core';
import fs from 'node:fs/promises';
import * as path from 'node:path';
import jsonToAst from 'json-to-ast';

interface ASTNode {
  type: 'Object' | 'Array' | 'Literal' | 'Property';
  loc: { start: { line: number; column: number }; end: { line: number; column: number } };
  children?: ASTNode[];
  key?: ASTNode & { value: string };
  value?: ASTNode;
}

export interface I18nPluginOptions {
  dir: string;
}

interface FileData {
  content: unknown;
  locations: Record<string, { line: number; column: number }>;
}

function collectLocations(
  ast: ASTNode,
  prefix = ''
): Record<string, { line: number; column: number }> {
  const locations: Record<string, { line: number; column: number }> = {};

  if (ast.type === 'Object' && ast.children) {
    for (const child of ast.children) {
      if (!child.key || !child.value) continue;
      const key = child.key.value;
      const fullKey = prefix ? `${prefix}.${key}` : key;
      locations[fullKey] = {
        line: child.key.loc.start.line,
        column: child.key.loc.start.column,
      };

      if (child.value.type === 'Object') {
        Object.assign(locations, collectLocations(child.value, fullKey));
      }
    }
  }

  return locations;
}

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options: I18nPluginOptions
) {
  const localesDir = path.resolve(ctx.root, options.dir);

  rpc.handle('i18n:getData', async () => {
    try {
      const files = await fs.readdir(localesDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const result: Record<string, FileData> = {};

      for (const file of jsonFiles) {
        const filePath = path.join(localesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        try {
          const ast = jsonToAst(content);
          const locations = collectLocations(ast);
          result[file] = {
            content: JSON.parse(content),
            locations,
          };
        } catch {
          result[file] = {
            content: JSON.parse(content),
            locations: {},
          };
        }
      }

      return result;
    } catch (e) {
      console.error('Failed to read locales', e);
      return {};
    }
  });

  rpc.handle('i18n:save', async (payload: unknown) => {
    const { file, content } = payload as { file: string; content: unknown };
    const filePath = safeResolve(localesDir, file);

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  });
}

```

---

## plugins/i18n/src/ui/I18nPanel.vue

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { RpcClientInterface } from '@u-devtools/core';
import { UButton, USelect } from '@u-devtools/ui';

const props = defineProps<{
  rpc: RpcClientInterface;
  notify: (msg: string) => void;
  openFile?: (file: string, line: number, column: number) => Promise<void>;
  onRegisterRefresh?: (fn: () => void) => void;
  storage?: { get: <T>(key: string, def: T) => T; set: <T>(key: string, value: T) => void };
}>();

interface FileData {
  content: unknown;
  locations: Record<string, { line: number; column: number }>;
}

const fileData = ref<Record<string, FileData>>({});
const activeFile = ref<string>('');
const loading = ref(false);
const editorContent = ref<string>('');
const isSaving = ref(false);

const translations = computed(() => {
  const result: Record<string, unknown> = {};
  for (const [file, data] of Object.entries(fileData.value)) {
    result[file] = data.content;
  }
  return result;
});

const locations = computed(() => {
  if (!activeFile.value || !fileData.value[activeFile.value]) {
    return {};
  }
  return fileData.value[activeFile.value].locations;
});

const fileOptions = computed(() => {
  return Object.keys(fileData.value).map((key) => ({
    label: key,
    value: key,
  }));
});

const loadData = async () => {
  loading.value = true;
  fileData.value = await props.rpc.call<Record<string, FileData>>('i18n:getData');

  const lastFile =
    (
      props.rpc as unknown as { storage?: { get: (key: string, def: string) => string } }
    ).storage?.get?.('lastFile', '') || '';

  if (lastFile && fileData.value[lastFile]) {
    activeFile.value = lastFile;
  } else if (!activeFile.value && Object.keys(fileData.value).length > 0) {
    activeFile.value = Object.keys(fileData.value)[0];
  }

  if (activeFile.value && fileData.value[activeFile.value]) {
    editorContent.value = JSON.stringify(fileData.value[activeFile.value].content, null, 2);
  }
  loading.value = false;
};

const save = async () => {
  if (!activeFile.value) return;
  isSaving.value = true;
  try {
    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(editorContent.value);
    } catch {
      props.notify('Invalid JSON format');
      isSaving.value = false;
      return;
    }

    await props.rpc.call('i18n:save', {
      file: activeFile.value,
      content: parsedContent,
    });
    if (fileData.value[activeFile.value]) {
      fileData.value[activeFile.value].content = parsedContent;
    }
    props.notify('Saved successfully!');
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.notify(`Error saving: ${error}`);
  } finally {
    isSaving.value = false;
  }
};

const onFileChange = () => {
  if (activeFile.value && fileData.value[activeFile.value]) {
    editorContent.value = JSON.stringify(fileData.value[activeFile.value].content, null, 2);
    if (props.storage) {
      props.storage.set('lastFile', activeFile.value);
    }
  } else {
    editorContent.value = '';
  }
};

const onEditorInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  editorContent.value = target.value;
};

const openInEditor = async (key: string) => {
  if (!activeFile.value || !props.openFile) return;
  const loc = locations.value[key];
  if (!loc) {
    props.notify(`Location not found for key: ${key}`);
    return;
  }

  try {
    await props.openFile(activeFile.value, loc.line, loc.column);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.notify(`Failed to open file: ${error}`);
  }
};

onMounted(() => {
  loadData();
  if (props.onRegisterRefresh) {
    props.onRegisterRefresh(loadData);
  }
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-4 border-b flex justify-between items-center bg-gray-50">
      <div class="flex gap-2 items-center">
        <USelect
          v-model="activeFile"
          :options="fileOptions"
          placeholder="Select locale file"
          size="sm"
          @update:modelValue="onFileChange"
        />
        <UButton
          variant="ghost"
          icon="i-carbon-renew"
          size="sm"
          :disabled="loading"
          @click="loadData"
          title="Refresh"
        />
      </div>

      <UButton variant="primary" icon="i-carbon-save" :loading="isSaving" @click="save">
        Save Changes
      </UButton>
    </div>

    <!-- Editor Area -->
    <div class="flex-1 overflow-auto p-4" v-if="activeFile && !loading">
      <div class="mb-2 flex gap-2 flex-wrap">
        <UButton
          v-for="(loc, key) in locations"
          :key="key"
          variant="ghost"
          size="sm"
          icon="i-carbon-document"
          @click="openInEditor(key)"
          :title="`Open ${key} in editor (line ${loc.line})`"
        >
          {{ key }}
        </UButton>
      </div>
      <textarea
        class="w-full h-full font-mono text-sm p-4 border rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        :value="editorContent"
        @input="onEditorInput"
      ></textarea>
    </div>
    <div v-else-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      Loading...
    </div>
    <div v-else class="flex-1 flex items-center justify-center text-gray-400">
      No file selected
    </div>
  </div>
</template>

```

---

## plugins/i18n/src/ui/vue-shim.d.ts

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<unknown, unknown, unknown>;
  export default component;
}

```

---

## plugins/i18n/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## plugins/inspector/README.md

```markdown
# @u-devtools/plugin-inspector

DOM element inspector plugin for Universal DevTools.

## Features

- Visual element selection (overlay)
- Element attributes table
- Text content preview
- Cross-frame communication via BroadcastChannel

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        inspectorPlugin()
      ]
    })
  ]
});
```

## How it works

1. Click "Select Element" button in DevTools
2. Hover over elements on the page (they will be highlighted)
3. Click an element to inspect its properties
4. View attributes and content in the DevTools panel

## License

MIT


```

---

## plugins/inspector/package.json

```json
{
  "name": "@u-devtools/plugin-inspector",
  "version": "0.1.0",
  "description": "Element inspector plugin for Universal DevTools",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/ui": "workspace:*",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3"
  }
}

```

---

## plugins/inspector/src/app.ts

```typescript
const channel = new BroadcastChannel('u-devtools-inspector');

let isActive = false;
let overlay: HTMLElement | null = null;

function createOverlay() {
  const el = document.createElement('div');
  el.style.cssText =
    'position: fixed; pointer-events: none; z-index: 99999; border: 2px solid #6366f1; background: rgba(99, 102, 241, 0.2); transition: all 0.1s; display: none;';
  document.body.appendChild(el);
  return el;
}

function updateOverlay(target: HTMLElement) {
  if (!overlay) overlay = createOverlay();
  const rect = target.getBoundingClientRect();
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.display = 'block';
}

function getElementInfo(el: HTMLElement) {
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    attrs[attr.name] = attr.value;
  }
  const rect = el.getBoundingClientRect();
  return {
    tagName: el.tagName.toLowerCase(),
    attrs,
    innerText: el.innerText.slice(0, 50),
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}

const onMouseOver = (e: MouseEvent) => {
  if (!isActive) return;
  e.stopPropagation();
  e.preventDefault();
  updateOverlay(e.target as HTMLElement);
};

const onClick = (e: MouseEvent) => {
  if (!isActive) return;
  e.stopPropagation();
  e.preventDefault();

  const info = getElementInfo(e.target as HTMLElement);

  channel.postMessage({ type: 'element-picked', data: info });

  toggleInspector(false);
};

function toggleInspector(state: boolean) {
  isActive = state;
  if (!isActive && overlay) {
    overlay.style.display = 'none';
  }
  document.body.style.cursor = isActive ? 'crosshair' : 'default';
}

channel.onmessage = (event) => {
  if (event.data.type === 'toggle-inspector') {
    toggleInspector(event.data.state);
  }
};

document.addEventListener('mouseover', onMouseOver, true);
document.addEventListener('click', onClick, true);

```

---

## plugins/inspector/src/client.ts

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import InspectorPanel from './ui/InspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Inspector',
  icon: 'i-carbon-search-locate',

  renderMain(el, api) {
    const app = createApp(InspectorPanel);
    app.mount(el);
    return () => app.unmount();
  },
};

export default plugin;

```

---

## plugins/inspector/src/index.ts

```typescript
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const inspectorPlugin = (): DevToolsPlugin => ({
  name: 'Inspector',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'),
});

```

---

## plugins/inspector/src/ui/InspectorPanel.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton } from '@u-devtools/ui';

const isInspecting = ref(false);
const selectedElement = ref<{
  tagName: string;
  attrs: Record<string, string>;
  innerText?: string;
  rect?: { x: number; y: number; width: number; height: number };
} | null>(null);
const channel = new BroadcastChannel('u-devtools-inspector');

const toggle = () => {
  isInspecting.value = !isInspecting.value;
  channel.postMessage({ type: 'toggle-inspector', state: isInspecting.value });
};

const onMessage = (e: MessageEvent) => {
  if (e.data.type === 'element-picked') {
    selectedElement.value = e.data.data;
    isInspecting.value = false;
  }
};

onMounted(() => {
  channel.addEventListener('message', onMessage);
});

onUnmounted(() => {
  channel.removeEventListener('message', onMessage);
  channel.close();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-4 border-b flex items-center gap-4 bg-gray-50">
      <UButton
        :variant="isInspecting ? 'primary' : 'secondary'"
        icon="i-carbon-search-locate"
        @click="toggle"
      >
        {{ isInspecting ? 'Click on page element...' : 'Select Element' }}
      </UButton>
    </div>

    <!-- Details View -->
    <div class="flex-1 p-6 overflow-auto" v-if="selectedElement">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl font-bold text-indigo-600">&lt;{{ selectedElement.tagName }}&gt;</span>
      </div>

      <!-- Attributes Table -->
      <div class="border rounded bg-white shadow-sm overflow-hidden">
        <div class="bg-gray-100 px-4 py-2 font-semibold border-b text-sm">Attributes</div>
        <table class="w-full text-sm">
          <tbody>
            <tr
              v-for="(val, key) in selectedElement.attrs"
              :key="key"
              class="border-b last:border-0 hover:bg-gray-50"
            >
              <td class="px-4 py-2 font-mono text-indigo-600 w-1/3">{{ key }}</td>
              <td class="px-4 py-2 font-mono text-gray-600 break-all">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Content Preview -->
      <div class="mt-6" v-if="selectedElement.innerText">
        <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Text Content</div>
        <div class="p-4 bg-gray-50 rounded border font-mono text-sm">
          {{ selectedElement.innerText }}
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
      <div class="i-carbon-search text-6xl opacity-20" />
      <p>Select an element on the page to inspect properties</p>
    </div>
  </div>
</template>


```

---

## plugins/inspector/src/ui/vue-shim.d.ts

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

```

---

## plugins/inspector/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## plugins/network/README.md

```markdown
# @u-devtools/plugin-network

Network request logger plugin for Universal DevTools.

## Features

- Intercepts `fetch` requests
- Real-time request monitoring
- Status code badges (color-coded)
- Request duration tracking
- URL filtering
- Request history (up to 100 requests)

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { networkPlugin } from '@u-devtools/plugin-network';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        networkPlugin()
      ]
    })
  ]
});
```

## Commands

- `net.clear` - Clear request history

## License

MIT


```

---

## plugins/network/package.json

```json
{
  "name": "@u-devtools/plugin-network",
  "version": "0.1.0",
  "description": "Network logger plugin for Universal DevTools",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "workspace:*",
    "@u-devtools/ui": "workspace:*",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.3"
  }
}

```

---

## plugins/network/src/app.ts

```typescript
const channel = new BroadcastChannel('u-devtools-network');

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url =
    typeof resource === 'string'
      ? resource
      : resource instanceof Request
        ? resource.url
        : String(resource);
  const method = config?.method || 'GET';
  const startTime = Date.now();
  const id = Math.random().toString(36).slice(2);

  channel.postMessage({
    type: 'request-start',
    data: { id, url, method, startTime },
  });

  try {
    const response = await originalFetch(...args);

    channel.postMessage({
      type: 'request-end',
      data: {
        id,
        status: response.status,
        statusText: response.statusText,
        endTime: Date.now(),
        duration: Date.now() - startTime,
      },
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network Error';
    channel.postMessage({
      type: 'request-error',
      data: {
        id,
        error: errorMessage,
        endTime: Date.now(),
        duration: Date.now() - startTime,
      },
    });
    throw error;
  }
};

```

---

## plugins/network/src/client.ts

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import NetworkPanel from './ui/NetworkPanel.vue';

const clearSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'Network',
  icon: 'i-carbon-network-4',

  commands: [
    {
      id: 'net.clear',
      label: 'Clear Requests',
      icon: 'i-carbon-clean',
      action: () => {
        clearSignal.value();
      },
    },
  ],

  renderMain(el, api) {
    const app = createApp(NetworkPanel, {
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    });
    app.mount(el);
    return () => app.unmount();
  },
};

export default plugin;

```

---

## plugins/network/src/index.ts

```typescript
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const networkPlugin = (): DevToolsPlugin => ({
  name: 'Network',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'),
});

```

---

## plugins/network/src/ui/NetworkPanel.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { UTable, UBadge, UButton, UInput } from '@u-devtools/ui';

defineProps<{
  onRegisterClear?: (fn: () => void) => void;
}>();

interface NetRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  duration?: number;
  error?: string;
  timestamp: number;
}

const requests = ref<NetRequest[]>([]);
const filter = ref('');
const channel = new BroadcastChannel('u-devtools-network');

const onMessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === 'request-start') {
    requests.value.unshift({
      ...data,
      timestamp: data.startTime,
      status: 0,
    });
  } else if (type === 'request-end' || type === 'request-error') {
    const req = requests.value.find((r) => r.id === data.id);
    if (req) {
      Object.assign(req, data);
    }
  }

  if (requests.value.length > 100) {
    requests.value.pop();
  }
};

const clear = () => {
  requests.value = [];
};

const filteredRequests = computed(() => {
  if (!filter.value) return requests.value;
  return requests.value.filter((r) => r.url.toLowerCase().includes(filter.value.toLowerCase()));
});

const getStatusColor = (status?: number) => {
  if (!status) return 'gray';
  if (status >= 200 && status < 300) return 'green';
  if (status >= 300 && status < 400) return 'blue';
  if (status >= 400 && status < 500) return 'yellow';
  return 'red';
};

const props = defineProps<{
  onRegisterClear?: (fn: () => void) => void;
}>();

onMounted(() => {
  channel.addEventListener('message', onMessage);
  if (props.onRegisterClear) {
    props.onRegisterClear(clear);
  }
});

onUnmounted(() => {
  channel.removeEventListener('message', onMessage);
  channel.close();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-2 border-b bg-gray-50 flex gap-2">
      <UButton icon="i-carbon-clean" size="sm" @click="clear" title="Clear" />
      <UInput v-model="filter" placeholder="Filter URLs..." class="w-64" />
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-hidden bg-white">
      <UTable
        :rows="filteredRequests"
        :columns="[
          { key: 'method', label: 'Method', width: '80px' },
          { key: 'status', label: 'Status', width: '80px' },
          { key: 'url', label: 'Name' },
          { key: 'duration', label: 'Time', width: '100px' },
        ]"
      >
        <template #cell-method="{ val }">
          <span class="font-mono text-xs font-bold">{{ val }}</span>
        </template>

        <template #cell-status="{ val }">
          <UBadge :color="getStatusColor(val)">{{ val || '...' }}</UBadge>
        </template>

        <template #cell-url="{ val }">
          <div class="truncate max-w-[400px]" :title="val">{{ val }}</div>
        </template>

        <template #cell-duration="{ val }">
          <span v-if="val" class="text-gray-500">{{ val.toFixed(0) }} ms</span>
          <span v-else class="text-gray-300">-</span>
        </template>
      </UTable>
    </div>
  </div>
</template>


```

---

## plugins/network/src/ui/vue-shim.d.ts

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

```

---

## plugins/network/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'plugins/*'
  - 'playground'


```

---

## shared/vite.config.base.ts

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

interface ConfigOptions {
  entry: string;
  name: string;
  dir: string;
  external?: string[];
}

export function createViteConfig({ entry, name, dir, external = [] }: ConfigOptions) {
  return defineConfig({
    plugins: [
      vue(),
      dts({
        rollupTypes: true,
        tsconfigPath: resolve(dir, 'tsconfig.json'),
      }),
    ],
    build: {
      lib: {
        entry: resolve(dir, entry),
        name,
        fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['vue', 'vite', '@u-devtools/core', ...external],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  });
}

```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

---

## vitest.workspace.ts

```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['packages/*']);

```

---

