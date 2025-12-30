# 🛠️ Universal DevTools Kit

![npm version](https://img.shields.io/npm/v/@u-devtools/vite?color=indigo&style=flat-square)
![license](https://img.shields.io/npm/l/@u-devtools/vite?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)

## What is Universal DevTools Kit?

**Universal DevTools Kit is not a ready-made DevTools solution.** Instead, it's a **comprehensive framework and toolkit** for building your own custom DevTools tailored to your specific needs.

This kit provides you with:
- A complete architecture for running code in three execution contexts (Server, Client, App)
- Pre-built UI components and APIs
- Communication bridges between contexts
- Plugin system for extensibility
- Everything you need to create professional debugging tools

### Why Build Custom DevTools?

Unlike framework-specific tools (like Vue DevTools or React DevTools), Universal DevTools Kit allows you to:

- **Build tools that work across any framework** - Vue, React, Svelte, Lit, or Vanilla JS
- **Create domain-specific debuggers** - Custom tools for your design system, state management, or business logic
- **Integrate file system operations** - Build browser-based editors for config files, translations, or any project files
- **Unify your development experience** - Create a single DevTools interface for your entire tech stack
- **Full control over features** - Build exactly what you need, nothing more, nothing less

### Three Execution Contexts

Universal DevTools Kit operates in three distinct execution contexts, each serving a specific purpose:

1. **Server (Node.js)** - Runs in your Vite dev server
   - Access to file system
   - Read/write project files
   - Access Vite configuration
   - Database connections
   - Terminal commands

2. **Client (Vue 3 iframe)** - Runs in an isolated iframe
   - Plugin UI rendering
   - Settings management
   - Command palette
   - Visualizations and panels

3. **App (Window)** - Runs in your application's main window
   - DOM inspection and manipulation
   - Network request interception
   - Access to global `window` objects
   - Runtime state inspection
   - Event monitoring

### Use Cases

- **Design System Debugger** - Inspect component props, theme values, and design tokens
- **Translation Editor** - Visual editor for i18n files with live preview
- **State Inspector** - Monitor and modify application state across frameworks
- **API Debugger** - Intercept and replay network requests
- **Performance Profiler** - Track render times, memory usage, and bundle analysis
- **Route Manager** - Visual route editor and navigation debugger
- **Custom Business Logic Tools** - Build tools specific to your application's domain

## ✨ Features

- ⚡️ **Framework Agnostic:** Build DevTools that work with Vue, React, Svelte, Lit, or Vanilla JS
- 🔌 **Three Execution Contexts:** Run code in Server (Node.js), Client (Vue 3 iframe), and App (main window)
- 🌉 **Robust Communication:** Typed RPC over WebSocket (Server ↔ Client) and BroadcastChannel (App ↔ Client)
- 🎨 **Complete UI Kit:** 20+ pre-built components with dark theme support
- ⌨️ **Developer Experience:** Command Palette, persistent storage, settings management, keyboard shortcuts
- 📦 **Zero Config:** Auto-injects into your Vite project - no manual setup required
- 🔧 **TypeScript First:** Full TypeScript support with comprehensive type definitions
- 🎯 **Plugin System:** Extensible architecture with isolated plugin contexts
- 🛠️ **Overlay Menu API:** Add custom buttons to the DevTools launcher
- 📚 **Comprehensive Documentation:** Step-by-step guides and examples

## 🚀 Installation & Quick Start

### Step 1: Install Dependencies

Install the Universal DevTools Kit core package and plugins:

```bash
# Using npm
npm install -D @u-devtools/vite @u-devtools/client @u-devtools/overlay

# Using pnpm (recommended)
pnpm add -D @u-devtools/vite @u-devtools/client @u-devtools/overlay

# Using yarn
yarn add -D @u-devtools/vite @u-devtools/client @u-devtools/overlay
```

### Step 2: Install Plugins (Optional)

Install the plugins you want to use:

```bash
# Using npm
npm install -D \
  @u-devtools/plugin-i18n@latest \
  @u-devtools/plugin-network@latest \
  @u-devtools/plugin-inspector@latest \
  @u-devtools/plugin-terminal@latest \
  @u-devtools/plugin-storage@latest \
  @u-devtools/plugin-package-inspector@latest \
  @u-devtools/plugin-vue-inspector@latest \
  @u-devtools/plugin-vite-inspector@latest

# Using pnpm (recommended)
pnpm add -D \
  @u-devtools/plugin-i18n@latest \
  @u-devtools/plugin-network@latest \
  @u-devtools/plugin-inspector@latest \
  @u-devtools/plugin-terminal@latest \
  @u-devtools/plugin-storage@latest \
  @u-devtools/plugin-package-inspector@latest \
  @u-devtools/plugin-vue-inspector@latest \
  @u-devtools/plugin-vite-inspector@latest

# Using yarn
yarn add -D \
  @u-devtools/plugin-i18n@latest \
  @u-devtools/plugin-network@latest \
  @u-devtools/plugin-inspector@latest \
  @u-devtools/plugin-terminal@latest \
  @u-devtools/plugin-storage@latest \
  @u-devtools/plugin-package-inspector@latest \
  @u-devtools/plugin-vue-inspector@latest \
  @u-devtools/plugin-vite-inspector@latest
```

### Step 3: Configure Vite

Add the DevTools plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { networkPlugin } from '@u-devtools/plugin-network';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';
import { terminalPlugin } from '@u-devtools/plugin-terminal';
import { storagePlugin } from '@u-devtools/plugin-storage';
import { packageInspectorPlugin } from '@u-devtools/plugin-package-inspector';
import { vueInspectorPlugin } from '@u-devtools/plugin-vue-inspector';
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';

export default defineConfig({
  plugins: [
    vue(),
    createDevTools({
      // Base path for DevTools UI (in iframe)
      base: '/__devtools',
      plugins: [
        // i18n plugin: looks in src/locales directory
        i18nPlugin({ dir: 'src/locales' }),

        // Network plugin: intercepts fetch/xhr
        networkPlugin(),

        // Inspector plugin: allows selecting elements
        inspectorPlugin(),

        // Terminal plugin: full terminal with support for any commands
        terminalPlugin(),

        // Storage plugin: view LocalStorage/SessionStorage/Cookies
        storagePlugin(),

        // Package inspector plugin: view dependencies
        packageInspectorPlugin(),

        // Vue Inspector plugin: route inspector (Vue-specific)
        vueInspectorPlugin(),

        // Vite Inspector plugin: Vite diagnostics and management
        viteInspectorPlugin(),
      ],
    }),
  ],
  resolve: {
    // IMPORTANT: Deduplicate Vue to prevent duplicate instances in monorepo
    dedupe: ['vue'],
  },
});
```

### Step 4: Run Your Dev Server

Start your development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

You'll see a floating DevTools button (🛠️) in the bottom-right corner of your application. Click it to open the DevTools panel!

### Step 5: Create Your Own Plugin (Optional)

The easiest way to create a plugin is using the built-in generator:

#### Option A: Using the Generator (Recommended)

From the root of your project (or monorepo):

```bash
# In monorepo
pnpm create:plugin

# Or if published as npm package
npm create u-devtools@latest
```

The generator will ask you:
- **Project folder name** - Where to create the plugin (e.g., `plugins/my-feature`)
- **Plugin display name** - Name shown in DevTools (e.g., `My Feature`)
- **Package name** - Package name in package.json (e.g., `@u-devtools/plugin-my-feature`)
- **Description** - Plugin description
- **Features to include** - Select which features to scaffold:
  - ✅ Settings Schema (default)
  - ✅ Command Palette Commands (default)
  - ⬜ Sidebar Panel
  - ⬜ Overlay Menu Item
  - ✅ File System Operations (default)
  - ✅ App Context Communication (default)

The generator creates a complete plugin structure with examples for all selected features!

#### Option B: Manual Creation

If you prefer to create a plugin manually, see the [Plugin Development Guide](#4-plugin-development-guide) section.

### Next Steps

Now that you have DevTools set up, you can:
- Explore the built-in plugins in the DevTools panel
- Create your own custom plugins (see [Plugin Development Guide](#4-plugin-development-guide))
- Add server-side logic (see [Server Setup](#44-server-setup-serverts))
- Add app-side logic for DOM inspection (see [App Script](#45-app-script-appts))
- Use UI components (see [UI Components Library](#7-ui-components-library))
- Add settings and commands (see [Client Definition](#43-client-definition-clientts))

## 3. Architecture Deep Dive

Understanding the architecture is crucial for building effective plugins. Universal DevTools Kit uses a three-context architecture with specialized communication channels.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Node.js (Vite Server)                                  │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ Vite Plugin  │◄─┤ Plugin Server     │                │
│  │    Host      │  │     Logic        │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
                        │
                        │ RPC (WebSocket via Vite HMR)
                        │ - Typed method calls
                        │ - Event broadcasting
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Browser (Iframe) - Isolated Context                    │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ DevTools     │◄─┤ Plugin UI        │                │
│  │    Shell     │  │   Components     │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ BroadcastChannel
                        │ - Cross-window events
                        │ - App ↔ Client communication
                        │
┌─────────────────────────────────────────────────────────┐
│  Browser (User App) - Main Window                       │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ App Runtime  │◄─┤ Plugin App       │                │
│  │              │  │     Logic        │                │
│  └──────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### Execution Contexts Explained

#### 1. Server Context (Node.js)

**Location:** Runs inside your Vite dev server process

**Capabilities:**
- Full file system access (read/write project files)
- Access to Vite configuration and dev server instance
- Execute terminal commands
- Database connections
- Package management operations
- File watching and hot reloading

**When to use:**
- Reading or modifying project files
- Executing build commands
- Accessing server-side resources
- File system operations

**Communication:**
- Receives RPC calls from Client via WebSocket
- Can broadcast events to all connected clients
- Uses `RpcServerInterface` for method registration

#### 2. Client Context (Vue 3 iframe)

**Location:** Runs in an isolated iframe, separate from your application

**Capabilities:**
- Render plugin UI using Vue 3 (or any framework via mount adapters)
- Access to DevTools shell APIs (storage, settings, notifications)
- Command Palette integration
- Settings management UI
- Visualizations and data display

**When to use:**
- Building plugin user interfaces
- Displaying data from Server or App
- User interactions and form handling
- Settings and configuration UI

**Communication:**
- Calls Server methods via RPC
- Receives events from Server via RPC
- Communicates with App via BroadcastChannel
- Uses `ClientApi` for all operations

#### 3. App Context (Main Window)

**Location:** Scripts injected into your application's main window

**Capabilities:**
- DOM inspection and manipulation
- Network request interception (fetch, XHR)
- Access to global `window` objects
- Runtime state inspection
- Event monitoring and patching
- Overlay UI elements

**When to use:**
- Inspecting DOM elements
- Intercepting network requests
- Monitoring application events
- Accessing framework internals
- Creating overlay UI

**Communication:**
- Communicates with Client via BroadcastChannel
- Uses `AppBridge` for structured communication
- Can register overlay menu items

### Communication Patterns

#### Server ↔ Client: RPC over WebSocket

The Server and Client communicate using Remote Procedure Calls (RPC) over WebSocket, leveraging Vite's HMR connection.

**Server side:**
```ts
// Register a method
rpc.handle('my-plugin:read-file', async (path: string) => {
  return await fs.readFile(path, 'utf-8');
});

// Broadcast an event
rpc.broadcast('my-plugin:file-changed', { path, content });
```

**Client side:**
```ts
// Call a method
const content = await api.rpc.call('my-plugin:read-file', '/path/to/file');

// Listen for events
api.rpc.on('my-plugin:file-changed', (data) => {
  console.log('File changed:', data);
});
```

#### App ↔ Client: BroadcastChannel

The App and Client communicate using the BroadcastChannel API, which allows cross-window communication.

**App side:**
```ts
const bridge = new AppBridge('my-plugin');
bridge.send('element-selected', { id: 'my-element' });
```

**Client side:**
```ts
bridge.on('element-selected', (data) => {
  console.log('Element selected:', data);
});
```

### Data Flow Example

Here's how data flows through the three contexts in a typical scenario:

1. **User clicks a button in Client UI** → Triggers RPC call to Server
2. **Server reads file from disk** → Returns data to Client
3. **Client displays data** → User interacts with it
4. **Client sends command to App** → Via BroadcastChannel
5. **App modifies DOM** → Sends result back to Client
6. **Client updates UI** → Shows updated state

This architecture ensures:
- **Isolation:** Client UI doesn't interfere with your app
- **Security:** Server operations are sandboxed
- **Performance:** Each context runs in its optimal environment
- **Flexibility:** You can use any framework or library in each context

## 4. Plugin Development Guide

This guide will walk you through creating a plugin from scratch, covering all aspects of plugin development.

This section provides step-by-step tutorials for building plugins of increasing complexity.

### 8.1 Minimal Plugin

The simplest possible plugin that displays a message.

**Step 1:** Create `src/plugins/minimal/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';

export const minimalPlugin = () => definePlugin({
  name: 'Minimal Plugin',
  root: import.meta.url,
  client: './client',
});
```

**Step 2:** Create `src/plugins/minimal/client.ts`:

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp, h } from 'vue';

const plugin: PluginClientInstance = {
  name: 'Minimal Plugin',
  icon: 'Cube',
  
  renderMain(container, api) {
    const app = createApp({
      render: () => h('div', { class: 'p-4' }, [
        h('h1', { class: 'text-xl font-bold mb-2' }, 'Hello, World!'),
        h('p', { class: 'text-gray-400' }, 'This is a minimal plugin.')
      ])
    });
    
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

**Step 3:** Register in `vite.config.ts`:

```ts
import { createDevTools } from '@u-devtools/vite';
import { minimalPlugin } from './src/plugins/minimal';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [minimalPlugin()]
    })
  ]
});
```

### 8.2 Plugin with Server RPC

A plugin that reads a file from the server.

**Step 1:** Create `src/plugins/file-reader/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';
import { setupServer } from './server.js';

export const fileReaderPlugin = () => definePlugin({
  name: 'File Reader',
  root: import.meta.url,
  client: './client',
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});
```

**Step 2:** Create `src/plugins/file-reader/server.ts`:

```ts
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('file-reader:read', async (filePath: string) => {
    const fullPath = path.resolve(ctx.root, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}
```

**Step 3:** Create `src/plugins/file-reader/client.ts`:

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import FileReaderPanel from './ui/FileReaderPanel.vue';

const plugin: PluginClientInstance = {
  name: 'File Reader',
  icon: 'DocumentText',
  
  renderMain(container, api) {
    const app = createApp(FileReaderPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

**Step 4:** Create `src/plugins/file-reader/ui/FileReaderPanel.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UInput, UCodeBlock } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const filePath = ref('package.json');
const content = ref('');
const loading = ref(false);
const error = ref('');

const readFile = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await props.api.rpc.call('file-reader:read', filePath.value);
    if (result.success) {
      content.value = result.content;
    } else {
      error.value = result.error;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex gap-2">
      <UInput v-model="filePath" placeholder="File path..." class="flex-1" />
      <UButton @click="readFile" :loading="loading">Read</UButton>
    </div>
    
    <div v-if="error" class="text-red-400">{{ error }}</div>
    
    <UCodeBlock v-if="content" language="json" :code="content" />
  </div>
</template>
```

### 8.3 Plugin with App Script

A plugin that highlights clicked elements.

**Step 1:** Create `src/plugins/highlighter/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';

export const highlighterPlugin = () => definePlugin({
  name: 'Highlighter',
  root: import.meta.url,
  client: './client',
  app: './app',
});
```

**Step 2:** Create `src/plugins/highlighter/app.ts`:

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('highlighter');
let highlightedElement: HTMLElement | null = null;

// Listen for highlight command from Client
bridge.on('highlight', (data: { selector: string }) => {
  // Remove previous highlight
  if (highlightedElement) {
    highlightedElement.style.outline = '';
  }
  
  // Highlight new element
  const element = document.querySelector(data.selector) as HTMLElement;
  if (element) {
    element.style.outline = '2px solid red';
    highlightedElement = element;
    
    // Send element info to Client
    bridge.send('element-highlighted', {
      tagName: element.tagName,
      id: element.id,
      classes: Array.from(element.classList)
    });
  }
});

// HMR cleanup
const hot = (import.meta as any).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    if (highlightedElement) {
      highlightedElement.style.outline = '';
    }
    bridge.close();
  });
}
```

**Step 3:** Create `src/plugins/highlighter/client.ts` and UI:

```ts
// client.ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import HighlighterPanel from './ui/HighlighterPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Highlighter',
  icon: 'CursorArrowRays',
  
  renderMain(container, api) {
    const app = createApp(HighlighterPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

```vue
<!-- ui/HighlighterPanel.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UInput } from '@u-devtools/ui';
import { AppBridge } from '@u-devtools/core';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const selector = ref('#my-element');
const elementInfo = ref<{ tagName: string; id: string; classes: string[] } | null>(null);

const bridge = new AppBridge('highlighter');

const highlight = () => {
  bridge.send('highlight', { selector: selector.value });
};

onMounted(() => {
  bridge.on('element-highlighted', (data) => {
    elementInfo.value = data as typeof elementInfo.value;
  });
});

onUnmounted(() => {
  bridge.close();
});
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex gap-2">
      <UInput v-model="selector" placeholder="CSS selector..." class="flex-1" />
      <UButton @click="highlight">Highlight</UButton>
    </div>
    
    <div v-if="elementInfo" class="space-y-2">
      <div><strong>Tag:</strong> {{ elementInfo.tagName }}</div>
      <div v-if="elementInfo.id"><strong>ID:</strong> {{ elementInfo.id }}</div>
      <div v-if="elementInfo.classes.length">
        <strong>Classes:</strong> {{ elementInfo.classes.join(', ') }}
      </div>
    </div>
  </div>
</template>
```

### 8.4 Plugin with Settings

A plugin with user-configurable settings.

**Step 1:** Define settings in `client.ts`:

```ts
const plugin: PluginClientInstance = {
  name: 'Configurable Plugin',
  icon: 'Cog6Tooth',
  
  settings: {
    apiUrl: {
      label: 'API URL',
      description: 'Base URL for API requests',
      type: 'string',
      default: 'https://api.example.com'
    },
    timeout: {
      label: 'Request Timeout (ms)',
      type: 'number',
      default: 5000
    },
    retries: {
      label: 'Max Retries',
      type: 'number',
      default: 3
    },
    enabled: {
      label: 'Enable Plugin',
      type: 'boolean',
      default: true
    }
  },
  
  renderMain(container, api) {
    // Use settings
    const apiUrl = api.settings.get('apiUrl', 'https://api.example.com');
    const timeout = api.settings.get('timeout', 5000);
    
    // ... render UI
  }
};
```

**Step 2:** Use settings reactively in Vue:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const apiUrl = computed(() => props.api.settings.get('apiUrl', ''));
const timeout = computed(() => props.api.settings.get('timeout', 5000));

const updateSetting = () => {
  props.api.settings.set('apiUrl', 'https://new-api.example.com');
};
</script>
```

### 8.5 Plugin with Overlay Menu

A plugin that adds a button to the overlay menu.

**In `app.ts`:**

```ts
import { registerMenuItem } from '@u-devtools/core';

registerMenuItem({
  id: 'my-plugin:quick-action',
  label: 'Quick Action',
  icon: 'Bolt',
  order: 10,
  onClick: (ctx, event) => {
    // Open DevTools if closed
    if (!ctx.isOpen) {
      ctx.open();
    }
    
    // Switch to this plugin
    ctx.switchPlugin('My Plugin');
    
    // Perform action
    performQuickAction();
  },
  onDoubleClick: (ctx, event) => {
    // Double-click action
    performAdvancedAction();
  }
});
```

### 8.6 Complete Plugin Example

A complete plugin combining all features:

**File structure:**
```
complete-plugin/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── server.ts
│   ├── app.ts
│   └── ui/
│       ├── MainPanel.vue
│       ├── SidebarPanel.vue
│       └── SettingsPanel.vue
```

**See the existing plugins in the `plugins/` directory for real-world examples.**

## 8. Examples & Tutorials

This section provides step-by-step tutorials for building plugins of increasing complexity.

### 8.1 Minimal Plugin

The simplest possible plugin that displays a message.

**Step 1:** Create `src/plugins/minimal/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';

export const minimalPlugin = () => definePlugin({
  name: 'Minimal Plugin',
  root: import.meta.url,
  client: './client',
});
```

**Step 2:** Create `src/plugins/minimal/client.ts`:

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp, h } from 'vue';

const plugin: PluginClientInstance = {
  name: 'Minimal Plugin',
  icon: 'Cube',
  
  renderMain(container, api) {
    const app = createApp({
      render: () => h('div', { class: 'p-4' }, [
        h('h1', { class: 'text-xl font-bold mb-2' }, 'Hello, World!'),
        h('p', { class: 'text-gray-400' }, 'This is a minimal plugin.')
      ])
    });
    
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

### 8.2 Plugin with Server RPC

A plugin that reads a file from the server.

**Step 1:** Create `src/plugins/file-reader/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';
import { setupServer } from './server.js';

export const fileReaderPlugin = () => definePlugin({
  name: 'File Reader',
  root: import.meta.url,
  client: './client',
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});
```

**Step 2:** Create `src/plugins/file-reader/server.ts`:

```ts
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('file-reader:read', async (filePath: string) => {
    const fullPath = path.resolve(ctx.root, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}
```

**Step 3:** Create `src/plugins/file-reader/client.ts`:

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import FileReaderPanel from './ui/FileReaderPanel.vue';

const plugin: PluginClientInstance = {
  name: 'File Reader',
  icon: 'DocumentText',
  
  renderMain(container, api) {
    const app = createApp(FileReaderPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

**Step 4:** Create `src/plugins/file-reader/ui/FileReaderPanel.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UInput, UCodeBlock } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const filePath = ref('package.json');
const content = ref('');
const loading = ref(false);
const error = ref('');

const readFile = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await props.api.rpc.call('file-reader:read', filePath.value);
    if (result.success) {
      content.value = result.content;
    } else {
      error.value = result.error;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex gap-2">
      <UInput v-model="filePath" placeholder="File path..." class="flex-1" />
      <UButton @click="readFile" :loading="loading">Read</UButton>
    </div>
    
    <div v-if="error" class="text-red-400">{{ error }}</div>
    
    <UCodeBlock v-if="content" language="json" :code="content" />
  </div>
</template>
```

### 8.3 Plugin with App Script

A plugin that highlights clicked elements.

**Step 1:** Create `src/plugins/highlighter/index.ts`:

```ts
import { definePlugin } from '@u-devtools/kit';

export const highlighterPlugin = () => definePlugin({
  name: 'Highlighter',
  root: import.meta.url,
  client: './client',
  app: './app',
});
```

**Step 2:** Create `src/plugins/highlighter/app.ts`:

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('highlighter');
let highlightedElement: HTMLElement | null = null;

// Listen for highlight command from Client
bridge.on('highlight', (data: { selector: string }) => {
  // Remove previous highlight
  if (highlightedElement) {
    highlightedElement.style.outline = '';
  }
  
  // Highlight new element
  const element = document.querySelector(data.selector) as HTMLElement;
  if (element) {
    element.style.outline = '2px solid red';
    highlightedElement = element;
    
    // Send element info to Client
    bridge.send('element-highlighted', {
      tagName: element.tagName,
      id: element.id,
      classes: Array.from(element.classList)
    });
  }
});

// HMR cleanup
const hot = (import.meta as any).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    if (highlightedElement) {
      highlightedElement.style.outline = '';
    }
    bridge.close();
  });
}
```

**Step 3:** Create `src/plugins/highlighter/client.ts` and UI:

```ts
// client.ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import HighlighterPanel from './ui/HighlighterPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Highlighter',
  icon: 'CursorArrowRays',
  
  renderMain(container, api) {
    const app = createApp(HighlighterPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

```vue
<!-- ui/HighlighterPanel.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UInput } from '@u-devtools/ui';
import { AppBridge } from '@u-devtools/core';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const selector = ref('#my-element');
const elementInfo = ref<{ tagName: string; id: string; classes: string[] } | null>(null);

const bridge = new AppBridge('highlighter');

const highlight = () => {
  bridge.send('highlight', { selector: selector.value });
};

onMounted(() => {
  bridge.on('element-highlighted', (data) => {
    elementInfo.value = data as typeof elementInfo.value;
  });
});

onUnmounted(() => {
  bridge.close();
});
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex gap-2">
      <UInput v-model="selector" placeholder="CSS selector..." class="flex-1" />
      <UButton @click="highlight">Highlight</UButton>
    </div>
    
    <div v-if="elementInfo" class="space-y-2">
      <div><strong>Tag:</strong> {{ elementInfo.tagName }}</div>
      <div v-if="elementInfo.id"><strong>ID:</strong> {{ elementInfo.id }}</div>
      <div v-if="elementInfo.classes.length">
        <strong>Classes:</strong> {{ elementInfo.classes.join(', ') }}
      </div>
    </div>
  </div>
</template>
```

### 8.4 Plugin with Settings

A plugin with user-configurable settings.

**Step 1:** Define settings in `client.ts`:

```ts
const plugin: PluginClientInstance = {
  name: 'Configurable Plugin',
  icon: 'Cog6Tooth',
  
  settings: {
    apiUrl: {
      label: 'API URL',
      description: 'Base URL for API requests',
      type: 'string',
      default: 'https://api.example.com'
    },
    timeout: {
      label: 'Request Timeout (ms)',
      type: 'number',
      default: 5000
    },
    retries: {
      label: 'Max Retries',
      type: 'number',
      default: 3
    },
    enabled: {
      label: 'Enable Plugin',
      type: 'boolean',
      default: true
    }
  },
  
  renderMain(container, api) {
    // Use settings
    const apiUrl = api.settings.get('apiUrl', 'https://api.example.com');
    const timeout = api.settings.get('timeout', 5000);
    
    // ... render UI
  }
};
```

**Step 2:** Use settings reactively in Vue:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const apiUrl = computed(() => props.api.settings.get('apiUrl', ''));
const timeout = computed(() => props.api.settings.get('timeout', 5000));

const updateSetting = () => {
  props.api.settings.set('apiUrl', 'https://new-api.example.com');
};
</script>
```

### 8.5 Plugin with Overlay Menu

A plugin that adds a button to the overlay menu.

**In `app.ts`:**

```ts
import { registerMenuItem } from '@u-devtools/core';

registerMenuItem({
  id: 'my-plugin:quick-action',
  label: 'Quick Action',
  icon: 'Bolt',
  order: 10,
  onClick: (ctx, event) => {
    // Open DevTools if closed
    if (!ctx.isOpen) {
      ctx.open();
    }
    
    // Switch to this plugin
    ctx.switchPlugin('My Plugin');
    
    // Perform action
    performQuickAction();
  },
  onDoubleClick: (ctx, event) => {
    // Double-click action
    performAdvancedAction();
  }
});
```

### 8.6 Complete Plugin Example

A complete plugin combining all features:

**File structure:**
```
complete-plugin/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── server.ts
│   ├── app.ts
│   └── ui/
│       ├── MainPanel.vue
│       ├── SidebarPanel.vue
│       └── SettingsPanel.vue
```

**See the existing plugins in the `plugins/` directory for real-world examples.**

## 9. Existing Plugins (Reference Examples)

**Important:** The plugins listed below are **reference examples** included in this repository. They demonstrate various features and patterns, but they are **not production-ready features**. Use them as learning resources and starting points for your own plugins.

### Inspector Plugin

**Location:** `plugins/inspector/`

**What it demonstrates:**
- DOM element inspection and manipulation
- App context usage (DOM patching)
- Overlay menu integration
- Real-time element data updates
- CSS box model visualization
- Attribute and style editing

**Key features:**
- Click-to-inspect elements
- Visual overlay with element highlighting
- Editable CSS properties
- Box model visualization
- DOM tree navigation
- Accessibility information

**Source code:** [`plugins/inspector/`](../plugins/inspector/)

### Network Plugin

**Location:** `plugins/network/`

**What it demonstrates:**
- Network request interception (fetch, XHR)
- App context usage (runtime patching)
- Request/response logging
- Request replay functionality
- HMR cleanup patterns

**Key features:**
- Intercepts all fetch and XHR requests
- Displays request/response details
- Filtering and search
- Status code badges
- Request timing information

**Source code:** [`plugins/network/`](../plugins/network/)

### Storage Plugin

**Location:** `plugins/storage/`

**What it demonstrates:**
- Browser storage inspection
- Multiple storage types (LocalStorage, SessionStorage, IndexedDB, Cookies, Cache, File System)
- Table component usage
- Inline editing
- Storage manipulation

**Key features:**
- View all storage types
- Edit values inline
- Add/remove entries
- Clear storage
- Export data

**Source code:** [`plugins/storage/`](../plugins/storage/)

### I18n Plugin

**Location:** `plugins/i18n/`

**What it demonstrates:**
- File system operations (Server context)
- JSON file editing
- Tree view component
- Real-time file updates
- Server RPC patterns

**Key features:**
- Visual translation file editor
- File tree navigation
- Inline translation editing
- Support for nested keys
- File watching

**Source code:** [`plugins/i18n/`](../plugins/i18n/)

### Console Plugin

**Location:** `plugins/console/`

**What it demonstrates:**
- Console log interception
- App context patching
- Log filtering and display
- Console method patching

**Key features:**
- Captures console.log/warn/error
- Filter by log level
- Search functionality
- Clear logs

**Source code:** [`plugins/console/`](../plugins/console/)

### Terminal Plugin

**Location:** `plugins/terminal/`

**What it demonstrates:**
- Server-side terminal execution
- Command execution
- Real-time output streaming
- Server RPC with streaming

**Key features:**
- Execute terminal commands
- View command output
- Command history
- Working directory management

**Source code:** [`plugins/terminal/`](../plugins/terminal/)

### Vue Inspector Plugin

**Location:** `plugins/vue-inspector/`

**What it demonstrates:**
- Framework-specific inspection
- Vue component tree
- Component props and state
- Pinia store inspection
- Router information
- Timeline visualization

**Key features:**
- Vue component tree
- Component props editing
- Pinia store viewer
- Router route inspection
- Component timeline

**Source code:** [`plugins/vue-inspector/`](../plugins/vue-inspector/)

### Vite Inspector Plugin

**Location:** `plugins/vite-inspector/`

**What it demonstrates:**
- Vite module graph inspection
- Server context with Vite API
- Module dependency visualization
- Vite config inspection
- Plugin information

**Key features:**
- Module dependency graph
- Vite configuration viewer
- Plugin list
- Resolve information
- HMR events

**Source code:** [`plugins/vite-inspector/`](../plugins/vite-inspector/)

### Package Inspector Plugin

**Location:** `plugins/package-inspector/`

**What it demonstrates:**
- Package.json inspection
- Server-side file reading
- JSON tree display
- Package information display

**Key features:**
- View package.json
- Dependency information
- Scripts display
- Package metadata

**Source code:** [`plugins/package-inspector/`](../plugins/package-inspector/)

### How to Learn from These Examples

1. **Start with Inspector** - Best example of App context usage
2. **Study Network** - Excellent example of runtime patching and HMR cleanup
3. **Review I18n** - Comprehensive Server context example
4. **Examine Storage** - Good UI component usage examples
5. **Check Vue Inspector** - Framework integration patterns

Each plugin demonstrates different aspects of the toolkit. Use them as reference when building your own plugins.

## 10. Best Practices

Follow these best practices to build robust, maintainable plugins.

### 10.1 HMR Cleanup in App Scripts

**Always restore patches in HMR cleanup** to prevent memory leaks and conflicts:

```ts
// app.ts
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  // Your patched logic
  return originalFetch(...args);
};

// REQUIRED: Cleanup on HMR
const hot = (import.meta as any).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    window.fetch = originalFetch;  // Restore original
    bridge.close();                 // Close bridge
  });
}
```

**Why:** Without cleanup, patches accumulate on hot reload, causing memory leaks and unexpected behavior.

### 10.2 Error Handling

Always handle errors gracefully in all contexts:

**Server RPC:**
```ts
rpc.handle('my-plugin:method', async (payload) => {
  try {
    const result = await doSomething(payload);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
```

**Client:**
```ts
try {
  const result = await api.rpc.call('my-plugin:method', data);
  if (result.success) {
    // Handle success
  } else {
    api.notify(result.error, 'error');
  }
} catch (error) {
  api.notify('Request failed', 'error');
}
```

### 10.3 Type Safety

Use TypeScript types throughout your plugin:

```ts
// Define interfaces
interface MyData {
  id: string;
  name: string;
}

// Type RPC calls
const data = await api.rpc.call<MyData>('my-plugin:get-data', id);

// Type settings
const timeout = api.settings.get<number>('timeout', 5000);
```

### 10.4 Plugin Isolation

Each plugin has isolated:
- **Storage** - Namespaced by plugin name
- **Settings** - Namespaced by plugin name
- **RPC methods** - Use plugin prefix: `my-plugin:method-name`
- **Events** - Use plugin prefix: `my-plugin:event-name`

**Naming convention:**
```ts
// Good
rpc.handle('my-plugin:read-file', ...);
bridge.send('my-plugin:data-updated', ...);

// Bad
rpc.handle('read-file', ...);  // No prefix
```

### 10.5 Performance Considerations

- **Lazy load heavy components** - Don't import everything upfront
- **Use virtual lists** - For large datasets (UVirtualList)
- **Debounce frequent operations** - File watching, search, etc.
- **Clean up subscriptions** - Always unsubscribe from events
- **Minimize RPC calls** - Batch operations when possible

### 10.6 Naming Conventions

- **Plugin names:** Use PascalCase (e.g., `'My Plugin'`)
- **RPC methods:** Use kebab-case with plugin prefix (e.g., `'my-plugin:read-file'`)
- **Events:** Use kebab-case with plugin prefix (e.g., `'my-plugin:data-updated'`)
- **Settings keys:** Use camelCase (e.g., `'apiUrl'`, `'maxRetries'`)
- **Storage keys:** Use camelCase (e.g., `'lastPath'`, `'userPreferences'`)

## 11. Advanced Topics

### 11.1 Custom Vite Plugins in Plugins

You can include additional Vite plugins in your DevTools plugin:

```ts
import { definePlugin } from '@u-devtools/kit';
import myVitePlugin from './vite-plugin';

export const myPlugin = () => definePlugin({
  name: 'My Plugin',
  root: import.meta.url,
  client: './client',
  vitePlugins: [
    () => myVitePlugin({ option: 'value' })
  ]
});
```

### 11.2 Plugin Dependencies

Plugins can communicate via the Event Bus:

```ts
// Plugin A: Emit event
api.bus.emit('plugin-a:selection-changed', { itemId: 123 });

// Plugin B: Listen for event
api.bus.on('plugin-a:selection-changed', (data) => {
  // React to Plugin A's event
});
```

### 11.3 Cross-Plugin Communication

Use the Event Bus API for cross-plugin communication:

```ts
// Emit from one plugin
api.bus.emit('my-plugin:action', { data: 'value' });

// Listen in another plugin
api.bus.on('other-plugin:action', (data) => {
  // Handle event
});
```

### 11.4 Custom UI Themes

Components use CSS variables that you can override:

```css
:root {
  --udt-bg-root: #0a0a0a;
  --udt-bg-surface: #18181b;
  --udt-text: #f9fafb;
  --udt-text-dim: #9ca3af;
  --udt-border: #3f3f46;
}
```

### 11.5 Extending UI Components

You can extend or wrap UI components:

```vue
<script setup lang="ts">
import { UButton } from '@u-devtools/ui';

// Extend with additional functionality
const handleClick = () => {
  // Custom logic
  // Then call original
};
</script>

<template>
  <UButton @click="handleClick">
    <slot />
  </UButton>
</template>
```

## 12. Troubleshooting

### Common Issues

#### Plugin Not Appearing

**Problem:** Plugin doesn't show up in DevTools.

**Solutions:**
- Check that `client.ts` exports a default object
- Verify `name` and `icon` are set in `PluginClientInstance`
- Check browser console for errors
- Ensure plugin is registered in `vite.config.ts`

#### RPC Calls Failing

**Problem:** Server RPC methods not working.

**Solutions:**
- Verify method name matches exactly (case-sensitive)
- Check that method is registered in `setupServer`
- Ensure method returns a value (or Promise)
- Check server console for errors
- Verify WebSocket connection is active

#### App Script Not Running

**Problem:** `app.ts` code not executing.

**Solutions:**
- Verify `appPath` is set in plugin definition
- Check browser console for errors
- Ensure HMR cleanup is implemented
- Verify script is injected (check Network tab)

#### Settings Not Saving

**Problem:** Settings changes don't persist.

**Solutions:**
- Verify settings schema is defined in `client.ts`
- Check that setting key matches exactly
- Use `api.settings.set()` to update values
- Check browser LocalStorage for stored values

#### UI Components Not Rendering

**Problem:** Components don't appear or have wrong styles.

**Solutions:**
- Verify components are imported from `@u-devtools/ui`
- Check that Tailwind CSS is configured
- Ensure CSS variables are defined
- Verify component props are correct

### Debugging Tips

1. **Check Browser Console** - Both main window and DevTools iframe
2. **Check Server Console** - For RPC and file operation errors
3. **Use Network Tab** - Verify WebSocket connection
4. **Inspect LocalStorage** - Check storage and settings values
5. **Enable Verbose Logging** - Add console.log statements
6. **Check HMR Status** - Verify hot module replacement is working

### Performance Issues

- **Too many RPC calls** - Batch operations
- **Large data transfers** - Use pagination or streaming
- **Heavy UI rendering** - Use virtual lists or lazy loading
- **Memory leaks** - Ensure all subscriptions are cleaned up
- **Slow file operations** - Use async/await properly


### 4.0 Using the Plugin Generator

The easiest way to create a new plugin is using the built-in generator. It scaffolds a complete plugin structure with examples for common features.

#### In Monorepo

From the root of the monorepo:

```bash
pnpm create:plugin
```

#### As Published Package

Once published, users can run:

```bash
npm create u-devtools@latest
# or
pnpm create u-devtools
# or
yarn create u-devtools
```

#### Generator Features

The generator creates a plugin with:

- ✅ **Complete file structure** - All necessary files (index.ts, client.ts, app.ts, etc.)
- ✅ **TypeScript configuration** - Pre-configured tsconfig.json
- ✅ **Vite build setup** - Ready-to-use vite.config.ts
- ✅ **Example UI components** - Vue components demonstrating API usage
- ✅ **Feature selection** - Choose which features to include:
  - Settings schema with examples
  - Command Palette commands
  - Sidebar panel
  - Overlay menu item
  - File system operations (Server RPC)
  - App context communication (AppBridge)

#### Generated Structure

```
my-plugin/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── index.ts          # Plugin entry with RPC examples
    ├── client.ts         # Client definition with settings/commands
    ├── app.ts            # App context with overlay menu
    └── ui/
        ├── MyPanel.vue   # Main panel with all API examples
        └── SidebarPanel.vue  # Sidebar panel (if selected)
```

#### After Generation

1. **Install dependencies:**
   ```bash
   cd my-plugin
   pnpm install
   ```

2. **Build the plugin:**
   ```bash
   pnpm build
   ```

3. **Add to your project:**
   - Import in `vite.config.ts`
   - Register in `createDevTools({ plugins: [...] })`

4. **Start developing:**
   ```bash
   pnpm dev
   ```

The generated code includes comprehensive examples showing how to use all APIs. You can use it as a reference and customize it for your needs.

### 4.1 Plugin Structure

A plugin consists of several files, each serving a specific purpose. Here's the recommended directory structure:

```
my-plugin/
├── src/
│   ├── index.ts          # Plugin entry point (required)
│   ├── client.ts         # Client UI definition (required)
│   ├── server.ts         # Server-side logic (optional)
│   ├── app.ts            # App-side logic (optional)
│   └── ui/               # UI components (optional)
│       ├── MyPanel.vue
│       ├── Settings.vue
│       └── components/
│           └── MyComponent.vue
├── package.json
└── tsconfig.json
```

**File purposes:**

- **`index.ts`** - Plugin registration and configuration. Defines the plugin structure and entry points.
- **`client.ts`** - Client-side plugin definition. Specifies UI rendering, settings, and commands.
- **`server.ts`** - Server-side RPC handlers. Handles file operations, terminal commands, etc.
- **`app.ts`** - App-side logic. DOM inspection, network interception, runtime patching.
- **`ui/*.vue`** - Vue components for your plugin's UI.

### 4.2 Plugin Registration (`index.ts`)

The `index.ts` file is the entry point for your plugin. It exports a function that returns a `DevToolsPlugin` object.

#### Using `definePlugin` Helper (Recommended)

The easiest way to create a plugin is using the `definePlugin` helper from `@u-devtools/kit`:

```ts
import { definePlugin } from '@u-devtools/kit';
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { setupServer } from './server.js';

export interface MyPluginOptions {
  configPath?: string;
  enabled?: boolean;
}

export const myPlugin = (options: MyPluginOptions = {}) => definePlugin({
  name: 'My Plugin',
  root: import.meta.url,  // Required: pass import.meta.url
  client: './client',     // Path to client.ts (relative to this file)
  app: './app',           // Path to app.ts (optional)
  meta: {
    name: '@my-org/my-plugin',
    version: '1.0.0',
    description: 'My custom DevTools plugin',
    author: 'Your Name',
    homepage: 'https://github.com/my-org/my-plugin'
  },
  setupServer: (rpc: RpcServerInterface, ctx: ServerContext) => {
    setupServer(rpc, ctx, options);
  }
});
```

**Key points:**
- `root: import.meta.url` is required for path resolution
- Paths are relative to the `index.ts` file
- `definePlugin` automatically handles `.ts` vs `.js` extensions
- `meta` is optional but recommended for published plugins

#### Manual Plugin Definition

If you prefer manual control, you can define the plugin directly:

```ts
import type { DevToolsPlugin } from '@u-devtools/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const myPlugin = (): DevToolsPlugin => ({
  name: 'My Plugin',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'),
  setupServer: (rpc, ctx) => {
    rpc.handle('my-plugin:method', async (payload) => {
      return { result: 'data' };
    });
  },
  meta: {
    name: '@my-org/my-plugin',
    version: '1.0.0'
  }
});
```

**Plugin Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | `string` | ✅ | Display name of the plugin |
| `clientPath` / `client` | `string` | ✅ | Path to client.ts file |
| `appPath` / `app` | `string` | ❌ | Path to app.ts file (for App context) |
| `setupServer` | `function` | ❌ | Server-side setup function |
| `meta` | `object` | ❌ | Plugin metadata (name, version, etc.) |
| `vitePlugins` | `function[]` | ❌ | Additional Vite plugins to merge |

### 4.3 Client Definition (`client.ts`)

The `client.ts` file defines your plugin's UI and behavior in the Client context. It exports a `PluginClientInstance` object.

#### Required Properties

```ts
import type { PluginClientInstance } from '@u-devtools/core';

const plugin: PluginClientInstance = {
  name: 'My Plugin',  // Display name (required)
  icon: 'Cube',       // Heroicons icon name (required)
  
  // ... optional properties
};

export default plugin;
```

**Icon names:** Use any icon from [Heroicons](https://heroicons.com/). Just use the icon name (e.g., `'Cube'`, `'MagnifyingGlass'`, `'WrenchScrewdriver'`).

#### Optional Properties

##### Settings Schema

Define user-configurable settings that appear in the DevTools settings panel:

```ts
settings: {
  fontSize: {
    label: 'Font Size',
    description: 'Base font size for the plugin',
    type: 'number',
    default: 14
  },
  theme: {
    label: 'Theme',
    type: 'select',
    default: 'dark',
    options: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
      { label: 'Auto', value: 'auto' }
    ]
  },
  enabled: {
    label: 'Enable Feature',
    type: 'boolean',
    default: true
  },
  tags: {
    label: 'Tags',
    type: 'array',
    itemType: 'string',
    default: []
  }
}
```

**Setting types:**
- `'string'` - Text input
- `'number'` - Number input
- `'boolean'` - Checkbox
- `'select'` - Dropdown (requires `options`)
- `'array'` - Array input (requires `itemType` or `items`)

Access settings in your UI:
```ts
const fontSize = computed(() => api.settings.get('fontSize', 14));
api.settings.set('fontSize', 16);
```

##### Commands (Command Palette)

Register commands accessible via `Cmd+K` (or `Ctrl+K`):

```ts
commands: [
  {
    id: 'my-plugin:clear',
    label: 'Clear Data',
    icon: 'Trash',
    action: () => {
      // Clear plugin data
    },
    shortcut: ['Meta', 'K', 'C']  // Optional keyboard shortcut
  },
  {
    id: 'my-plugin:refresh',
    label: 'Refresh',
    icon: 'ArrowPath',
    action: async () => {
      await refreshData();
    }
  }
]
```

##### Render Functions

**`renderMain`** - Main panel content (required for most plugins):

```ts
renderMain(container, api) {
  const app = createApp(MyPanel, { api });
  app.mount(container);
  return () => app.unmount();  // Cleanup function
}
```

**`renderSidebar`** - Optional sidebar content:

```ts
renderSidebar(container, api) {
  const app = createApp(SidebarPanel, { api });
  app.mount(container);
  return () => app.unmount();
}
```

**`renderSettings`** - Custom settings UI (optional, uses default form if not provided):

```ts
renderSettings(container, api) {
  const app = createApp(CustomSettings, { api });
  app.mount(container);
  return () => app.unmount();
}
```

#### Complete Client Example

```ts
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './ui/MyPanel.vue';
import SidebarPanel from './ui/SidebarPanel.vue';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube',
  
  settings: {
    autoRefresh: {
      label: 'Auto Refresh',
      type: 'boolean',
      default: true
    },
    refreshInterval: {
      label: 'Refresh Interval (ms)',
      type: 'number',
      default: 1000
    }
  },
  
  commands: [
    {
      id: 'my-plugin:refresh',
      label: 'Refresh Data',
      icon: 'ArrowPath',
      action: () => {
        // Trigger refresh
      }
    }
  ],
  
  renderMain(container, api) {
    const app = createApp(MyPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
  
  renderSidebar(container, api) {
    const app = createApp(SidebarPanel, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

### 4.4 Server Setup (`server.ts`)

The `server.ts` file contains server-side logic that runs in the Node.js context. This is where you handle file operations, terminal commands, and other server-side tasks.

#### RPC Server Interface

The `setupServer` function receives two parameters:

```ts
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options?: MyPluginOptions
) {
  // Register RPC methods
  // Broadcast events
}
```

**`RpcServerInterface` methods:**

- **`handle(method, handler)`** - Register an RPC method
  ```ts
  rpc.handle('my-plugin:read-file', async (path: string) => {
    const content = await fs.readFile(path, 'utf-8');
    return content;
  });
  ```

- **`broadcast(event, data)`** - Broadcast event to all clients
  ```ts
  rpc.broadcast('my-plugin:file-changed', { path, content });
  ```

**`ServerContext` properties:**

- **`root`** - Project root directory (string)
- **`server`** - Vite dev server instance

#### File System Operations

```ts
import fs from 'node:fs/promises';
import path from 'node:path';

rpc.handle('my-plugin:read-file', async (filePath: string) => {
  const fullPath = path.resolve(ctx.root, filePath);
  return await fs.readFile(fullPath, 'utf-8');
});

rpc.handle('my-plugin:write-file', async ({ path: filePath, content }) => {
  const fullPath = path.resolve(ctx.root, filePath);
  await fs.writeFile(fullPath, content, 'utf-8');
  rpc.broadcast('my-plugin:file-saved', { path: filePath });
});
```

#### Error Handling

Always handle errors in RPC methods:

```ts
rpc.handle('my-plugin:read-file', async (path: string) => {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
```

#### Complete Server Example

```ts
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface MyPluginOptions {
  configPath?: string;
}

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options: MyPluginOptions = {}
) {
  const configPath = options.configPath || path.join(ctx.root, 'my-config.json');
  
  // Read config
  rpc.handle('my-plugin:get-config', async () => {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { default: true };
    }
  });
  
  // Write config
  rpc.handle('my-plugin:save-config', async (config: unknown) => {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    rpc.broadcast('my-plugin:config-changed', config);
    return { success: true };
  });
  
  // Watch for file changes
  if (ctx.server) {
    // Use Vite's file watcher if available
  }
}
```

### 4.5 App Script (`app.ts`)

The `app.ts` file contains code that runs in your application's main window. Use this for DOM inspection, network interception, and runtime patching.

#### When to Use App Script

- Inspecting or modifying DOM elements
- Intercepting network requests (fetch, XHR)
- Monitoring application events
- Accessing framework internals
- Creating overlay UI elements
- Registering overlay menu items

#### AppBridge Usage

The `AppBridge` is the primary way to communicate from App to Client:

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');

// Send data to Client
bridge.send('element-selected', { id: 'my-element', tagName: 'div' });

// Listen for events from Client
bridge.on('highlight-element', (data) => {
  const element = document.getElementById(data.id);
  if (element) {
    element.style.outline = '2px solid red';
  }
});

// Clean up
bridge.close();
```

#### DOM Inspection Example

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');

// Listen for clicks and send element data
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  bridge.send('element-clicked', {
    tagName: target.tagName,
    id: target.id,
    classes: Array.from(target.classList),
    rect: target.getBoundingClientRect()
  });
});
```

#### Network Interception Example

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('network');

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource] = args;
  const url = typeof resource === 'string' ? resource : resource.url;
  const startTime = Date.now();
  
  bridge.send('request-start', { url, startTime });
  
  try {
    const response = await originalFetch(...args);
    bridge.send('request-end', {
      url,
      status: response.status,
      duration: Date.now() - startTime
    });
    return response;
  } catch (error) {
    bridge.send('request-error', { url, error });
    throw error;
  }
};

// HMR cleanup (REQUIRED)
const hot = (import.meta as any).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    window.fetch = originalFetch;
    bridge.close();
  });
}
```

#### Overlay Menu Registration

Register buttons in the DevTools overlay menu:

```ts
import { registerMenuItem } from '@u-devtools/core';

registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube',
  order: 10,
  onClick: (ctx) => {
    if (!ctx.isOpen) {
      ctx.open();
    }
    ctx.switchPlugin('My Plugin');
  }
});
```

**Important:** Always restore patches in HMR cleanup to prevent memory leaks and conflicts.

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

## 5. Client API Reference

The `ClientApi` object is passed to all your render functions (`renderMain`, `renderSidebar`, `renderSettings`). It provides access to all DevTools functionality.

### 5.1 ClientApi Interface

```ts
interface ClientApi {
  rpc: RpcClientInterface;        // Server communication
  notify: (msg: string, type?: 'info' | 'error' | 'success') => void;
  storage: StorageApi;             // Plugin-scoped storage
  settings: SettingsApi;            // Plugin settings
  shortcuts: ShortcutApi;          // Keyboard shortcuts
  clipboard: ClipboardApi;          // Clipboard operations
  bus: EventBusApi;                // Event bus for cross-plugin communication
  dialog: DialogApi;               // Dialog modals
}
```

### 5.2 RPC Interface (`api.rpc`)

Communicate with the Server context via Remote Procedure Calls.

#### Methods

**`call<T>(method: string, payload?: unknown): Promise<T>`**

Call a server method and wait for the response:

```ts
// Simple call
const result = await api.rpc.call('my-plugin:get-data');

// Call with payload
const fileContent = await api.rpc.call('my-plugin:read-file', '/path/to/file');

// Typed call
interface FileData {
  content: string;
  size: number;
}
const data = await api.rpc.call<FileData>('my-plugin:get-file', { path: 'config.json' });
```

**`on(event: string, callback: (data: unknown) => void): () => void`**

Listen for server events. Returns an unsubscribe function:

```ts
// Listen for events
const unsubscribe = api.rpc.on('my-plugin:file-changed', (data) => {
  console.log('File changed:', data);
  // Update UI
});

// Clean up when component unmounts
onUnmounted(() => {
  unsubscribe();
});
```

**`off(event: string, callback: Function): void`** (optional)

Manually unsubscribe from events (alternative to using the return value from `on`).

### 5.3 Storage API (`api.storage`)

Plugin-scoped persistent storage using LocalStorage. Data is automatically namespaced by plugin name.

#### Methods

**`get<T>(key: string, defaultValue: T): T`**

Get a stored value:

```ts
const lastPath = api.storage.get('last-opened-path', '/default/path');
const items = api.storage.get<string[]>('items', []);
```

**`set<T>(key: string, value: T): void`**

Store a value:

```ts
api.storage.set('last-opened-path', '/new/path');
api.storage.set('items', ['item1', 'item2']);
```

**`remove(key: string): void`**

Delete a stored value:

```ts
api.storage.remove('last-opened-path');
```

**Example:**

```ts
// Save user preferences
const savePreferences = () => {
  api.storage.set('theme', 'dark');
  api.storage.set('fontSize', 14);
};

// Load preferences
const loadPreferences = () => {
  const theme = api.storage.get('theme', 'light');
  const fontSize = api.storage.get('fontSize', 12);
  return { theme, fontSize };
};
```

### 5.4 Settings API (`api.settings`)

Access and modify plugin settings defined in the `settings` schema.

#### Methods

**`get<T>(key: string, defaultValue?: T): T`**

Get a setting value:

```ts
const fontSize = api.settings.get('fontSize', 14);
const theme = api.settings.get('theme', 'dark');
```

**`set(key: string, value: unknown): void`**

Set a setting value:

```ts
api.settings.set('fontSize', 16);
api.settings.set('theme', 'light');
```

**`all: Record<string, unknown>`**

Reactive object containing all settings (useful for Vue reactivity):

```ts
import { computed } from 'vue';

const fontSize = computed(() => api.settings.all.fontSize as number);
```

**Example with Vue:**

```ts
<script setup lang="ts">
import { computed, watch } from 'vue';

const fontSize = computed(() => api.settings.get('fontSize', 14));

watch(fontSize, (newSize) => {
  // React to setting changes
  document.documentElement.style.fontSize = `${newSize}px`;
});
</script>
```

### 5.5 Shortcuts API (`api.shortcuts`)

Register keyboard shortcuts for your plugin.

#### Methods

**`register(keys: string[], action: () => void): () => void`**

Register a keyboard shortcut. Returns an unsubscribe function:

```ts
// Register Cmd+K, C (or Ctrl+K, C)
const unsubscribe = api.shortcuts.register(['Meta', 'K', 'C'], () => {
  console.log('Shortcut pressed!');
});

// Or Ctrl on Windows/Linux
api.shortcuts.register(['Control', 'K', 'C'], () => {
  // Action
});

// Clean up
onUnmounted(() => {
  unsubscribe();
});
```

**Key format:**
- Use `'Meta'` for Cmd on Mac, Ctrl on Windows/Linux
- Use `'Control'` for Ctrl on all platforms
- Use `'Alt'` for Option/Alt
- Use `'Shift'` for Shift
- Use key names like `'K'`, `'Enter'`, `'Escape'`, `'ArrowUp'`, etc.

### 5.6 Clipboard API (`api.clipboard`)

Copy and read from the system clipboard.

#### Methods

**`copy(text: string, successMessage?: string): Promise<void>`**

Copy text to clipboard:

```ts
await api.clipboard.copy('Hello, World!');
await api.clipboard.copy(jsonString, 'JSON copied to clipboard!');
```

**`read(): Promise<string>`**

Read text from clipboard:

```ts
const clipboardText = await api.clipboard.read();
console.log('Clipboard:', clipboardText);
```

**Example:**

```ts
const copyToClipboard = async (data: unknown) => {
  const json = JSON.stringify(data, null, 2);
  await api.clipboard.copy(json, 'Data copied to clipboard!');
};
```

### 5.7 Event Bus API (`api.bus`)

Cross-plugin event communication system.

#### Methods

**`emit(event: string, data?: unknown): void`**

Emit an event that other plugins can listen to:

```ts
api.bus.emit('my-plugin:data-updated', { id: 123, data: 'new value' });
```

**`on(event: string, handler: (data: unknown) => void): () => void`**

Subscribe to events from any plugin:

```ts
const unsubscribe = api.bus.on('other-plugin:action', (data) => {
  console.log('Other plugin action:', data);
  // React to the event
});

onUnmounted(() => {
  unsubscribe();
});
```

**`off(event: string, handler: Function): void`**

Unsubscribe from an event:

```ts
const handler = (data: unknown) => { /* ... */ };
api.bus.on('event', handler);
// Later...
api.bus.off('event', handler);
```

**Example - Cross-plugin communication:**

```ts
// Plugin A: Emit event
api.bus.emit('plugin-a:selection-changed', { itemId: 123 });

// Plugin B: Listen for event
api.bus.on('plugin-a:selection-changed', (data) => {
  const { itemId } = data as { itemId: number };
  // Update Plugin B's UI based on Plugin A's selection
});
```

### 5.8 Dialog API (`api.dialog`)

Show modal dialogs for user confirmation and input.

#### Methods

**`confirm(options): Promise<boolean>`**

Show a confirmation dialog:

```ts
const confirmed = await api.dialog.confirm({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  confirmText: 'Delete',  // Optional, defaults to "OK"
  cancelText: 'Cancel'    // Optional, defaults to "Cancel"
});

if (confirmed) {
  // User clicked "Delete"
  await deleteItem();
}
```

**`prompt(options): Promise<string | null>`**

Show an input dialog:

```ts
const input = await api.dialog.prompt({
  title: 'Enter Name',
  message: 'What would you like to name this item?',
  defaultValue: 'Untitled'  // Optional
});

if (input) {
  // User entered text and clicked OK
  console.log('Name:', input);
} else {
  // User clicked Cancel
}
```

### 5.9 Notifications (`api.notify`)

Show toast notifications to the user.

```ts
// Info notification (default)
api.notify('Operation completed');

// Success notification
api.notify('Data saved successfully!', 'success');

// Error notification
api.notify('Failed to save data', 'error');
```

**Types:**
- `'info'` (default) - Blue notification
- `'success'` - Green notification
- `'error'` - Red notification

### 5.10 Settings Schema

When defining settings in your `client.ts`, you can use various types:

#### Setting Types

**String:**
```ts
settings: {
  apiKey: {
    label: 'API Key',
    description: 'Your API key for authentication',
    type: 'string',
    default: ''
  }
}
```

**Number:**
```ts
settings: {
  timeout: {
    label: 'Request Timeout (ms)',
    type: 'number',
    default: 5000
  }
}
```

**Boolean:**
```ts
settings: {
  enabled: {
    label: 'Enable Feature',
    type: 'boolean',
    default: true
  }
}
```

**Select (Dropdown):**
```ts
settings: {
  theme: {
    label: 'Theme',
    type: 'select',
    default: 'dark',
    options: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
      { label: 'Auto', value: 'auto' }
    ]
  }
}
```

**Array (String items):**
```ts
settings: {
  tags: {
    label: 'Tags',
    type: 'array',
    itemType: 'string',
    default: []
  }
}
```

**Array (Number items):**
```ts
settings: {
  sizes: {
    label: 'Sizes',
    type: 'array',
    itemType: 'number',
    default: [10, 20, 30]
  }
}
```

**Array (Object items):**
```ts
settings: {
  endpoints: {
    label: 'API Endpoints',
    type: 'array',
    items: {
      url: {
        label: 'URL',
        type: 'string',
        default: ''
      },
      method: {
        label: 'Method',
        type: 'select',
        default: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' }
        ]
      }
    },
    default: []
  }
}
```

### 5.11 Commands (Command Palette)

Commands appear in the Command Palette (opened with `Cmd+K` or `Ctrl+K`).

#### Command Interface

```ts
interface PluginCommand {
  id: string;                    // Unique command ID
  label: string;                 // Display name
  icon?: string;                 // Heroicons icon name
  action: () => void | Promise<void>;  // Command action
  shortcut?: string[];            // Optional keyboard shortcut
}
```

#### Example

```ts
commands: [
  {
    id: 'my-plugin:clear',
    label: 'Clear All Data',
    icon: 'Trash',
    action: async () => {
      await clearAllData();
      api.notify('Data cleared', 'success');
    },
    shortcut: ['Meta', 'K', 'C']
  },
  {
    id: 'my-plugin:export',
    label: 'Export Data',
    icon: 'ArrowDownTray',
    action: () => {
      exportData();
    }
  }
]
```

## 6. Overlay Menu API

The Overlay Menu API allows you to add custom buttons to the DevTools launcher overlay. These buttons appear in the bottom-right corner of your application.

### 6.1 registerMenuItem

Register a menu item (button) in the overlay:

```ts
import { registerMenuItem } from '@u-devtools/core';

registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube',  // Heroicons icon name
  order: 10,    // Display order (lower = left)
  onClick: (ctx, event) => {
    // Handle click
  }
});
```

### 6.2 OverlayMenuItem Interface

```ts
interface OverlayMenuItem {
  id: string;                    // Unique identifier
  label: string;                  // Tooltip text
  icon?: string;                  // Heroicons icon name
  iconSvg?: string;               // SVG as text (alternative to icon)
  iconUrl?: string;               // URL to icon image (alternative to icon)
  order?: number;                 // Display order (default: 0)
  
  // Event handlers
  onClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onDoubleClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onContextMenu?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseEnter?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseLeave?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseDown?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseUp?: (ctx: OverlayContext, event: MouseEvent) => void;
  onKeyDown?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onKeyUp?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onFocus?: (ctx: OverlayContext, event: FocusEvent) => void;
  onBlur?: (ctx: OverlayContext, event: FocusEvent) => void;
}
```

### 6.3 Icon Options

You can provide an icon in three ways:

**1. Heroicons name (recommended):**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube'  // Uses Heroicons
});
```

**2. SVG as text:**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  iconSvg: '<svg>...</svg>'
});
```

**3. URL to image:**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  iconUrl: 'https://example.com/icon.svg'
});
```

### 6.4 OverlayContext

The `OverlayContext` provides methods to control DevTools:

```ts
interface OverlayContext {
  open(): void;                    // Open DevTools
  close(): void;                   // Close DevTools
  toggle(): void;                  // Toggle DevTools
  isOpen: boolean;                 // Current state
  switchPlugin(name: string): void;  // Switch to a plugin
  switchTab(pluginName: string, tabName: string): void;  // Switch tab
  createBridge(namespace: string): AppBridge;  // Create AppBridge
}
```

### 6.5 Complete Example

```ts
import { registerMenuItem } from '@u-devtools/core';

registerMenuItem({
  id: 'my-plugin:inspect',
  label: 'Inspect Element',
  icon: 'MagnifyingGlass',
  order: 10,
  onClick: async (ctx, event) => {
    // Open DevTools if closed
    if (!ctx.isOpen) {
      ctx.open();
    }
    
    // Switch to this plugin
    ctx.switchPlugin('My Plugin');
    
    // Switch to a specific tab
    ctx.switchTab('My Plugin', 'Inspector');
    
    // Start inspection mode
    startInspection();
  },
  onDoubleClick: (ctx, event) => {
    // Double-click action
    console.log('Double clicked!');
  },
  onContextMenu: (ctx, event) => {
    // Right-click action
    event.preventDefault();
    showContextMenu(event);
  }
});
```

### 6.6 Event Handler Examples

**Mouse events:**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube',
  onMouseEnter: (ctx, event) => {
    // Show tooltip or highlight
  },
  onMouseLeave: (ctx, event) => {
    // Hide tooltip
  },
  onMouseDown: (ctx, event) => {
    // Handle mouse down
  },
  onMouseUp: (ctx, event) => {
    // Handle mouse up
  }
});
```

**Keyboard events:**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube',
  onKeyDown: (ctx, event) => {
    if (event.key === 'Enter') {
      // Handle Enter key
    }
  }
});
```

**Focus events:**
```ts
registerMenuItem({
  id: 'my-plugin:action',
  label: 'My Action',
  icon: 'Cube',
  onFocus: (ctx, event) => {
    // Button received focus
  },
  onBlur: (ctx, event) => {
    // Button lost focus
  }
});
```

## 7. UI Components Library

Universal DevTools Kit includes a comprehensive UI component library (`@u-devtools/ui`) built with Vue 3 and Tailwind CSS. All components are designed for dark theme and are fully accessible.

### Importing Components

```ts
import { UButton, UInput, UTable, UIcon } from '@u-devtools/ui';
```

### 7.1 Basic Components

#### UButton

A versatile button component with multiple variants and sizes.

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` - Button style (default: `'secondary'`)
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Button size (default: `'md'`)
- `icon?: string` - Heroicons icon name
- `loading?: boolean` - Show loading spinner

**Events:**
- `@click` - Click event

**Example:**
```vue
<UButton variant="primary" icon="Save" @click="save">Save</UButton>
<UButton variant="danger" size="sm" @click="delete">Delete</UButton>
<UButton variant="ghost" icon="ArrowPath" :loading="isLoading">Refresh</UButton>
```

#### UInput

Text input field with prefix/suffix support.

**Props:**
- `modelValue?: string | number` - v-model value
- `type?: string` - Input type (default: `'text'`)
- `placeholder?: string` - Placeholder text
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Input size (default: `'md'`)
- `disabled?: boolean` - Disabled state
- `readonly?: boolean` - Readonly state
- `prefix?: string` - Text prefix
- `suffix?: string` - Text suffix
- `prefixIcon?: string` - Heroicons icon name for prefix
- `suffixIcon?: string` - Heroicons icon name for suffix
- `prepend?: string` - External text before input
- `append?: string` - External text after input

**Events:**
- `@update:modelValue` - Value change
- `@focus` - Focus event
- `@blur` - Blur event
- `@keydown` - Key down event
- `@keyup` - Key up event
- `@enter` - Enter key pressed

**Slots:**
- `prefix` - Custom prefix content
- `suffix` - Custom suffix content
- `prepend` - Custom prepend content
- `append` - Custom append content

**Example:**
```vue
<UInput v-model="search" placeholder="Search..." prefixIcon="MagnifyingGlass" />
<UInput v-model="price" type="number" prefix="$" suffix="USD" />
<UInput v-model="url" prepend="https://" append=".com" />
```

#### USelect

Dropdown select component.

**Props:**
- `modelValue?: string` - Selected value
- `options?: Array<{ label: string; value: string }>` - Select options
- `placeholder?: string` - Placeholder text
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Select size (default: `'md'`)
- `disabled?: boolean` - Disabled state

**Events:**
- `@update:modelValue` - Value change
- `@change` - Change event

**Example:**
```vue
<USelect
  v-model="selected"
  :options="[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]"
  placeholder="Select an option"
/>
```

#### UBadge

Status badge with color variants.

**Props:**
- `color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue'` - Badge color (default: `'gray'`)
- `label?: string | number` - Badge text
- `size?: 'xs' | 'sm' | 'md'` - Badge size (default: `'md'`)

**Slots:**
- Default slot - Badge content

**Example:**
```vue
<UBadge color="green" label="Active" />
<UBadge color="red">Error</UBadge>
<UBadge color="blue" size="sm">New</UBadge>
```

#### UIcon

Icon wrapper component for Heroicons.

**Props:**
- `name: string` - Heroicons icon name (required)
- `size?: string` - Icon size class (e.g., `'w-5 h-5'`)

**Example:**
```vue
<UIcon name="Cube" />
<UIcon name="MagnifyingGlass" size="w-6 h-6" />
```

### 7.2 Layout Components

#### UTable

Data table with customizable columns and cell templates.

**Props:**
- `columns: Array<{ key: string; label: string; width?: string }>` - Column definitions
- `rows: unknown[]` - Table data
- `rowKey?: string | ((row: unknown, index: number) => string)` - Row key function

**Slots:**
- `cell-{columnKey}` - Custom cell content for each column
  - Slot props: `{ row, val, rowIndex }`

**Example:**
```vue
<UTable
  :columns="[
    { key: 'name', label: 'Name', width: '30%' },
    { key: 'value', label: 'Value', width: '50%' },
    { key: 'actions', label: 'Actions', width: '80px' }
  ]"
  :rows="data"
>
  <template #cell-value="{ val }">
    <code>{{ val }}</code>
  </template>
  <template #cell-actions="{ row }">
    <UButton size="xs" @click="edit(row)">Edit</UButton>
  </template>
</UTable>
```

#### UTabs

Tab navigation component.

**Props:**
- `items: string[]` - Tab labels
- `modelValue?: string` - Active tab

**Events:**
- `@update:modelValue` - Tab change

**Example:**
```vue
<UTabs :items="['Overview', 'Details', 'Settings']" v-model="activeTab" />
```

#### UTabButtons

Button-style tabs (alternative to UTabs).

**Props:**
- `items: string[]` - Tab labels
- `modelValue: string` - Active tab

**Events:**
- `@update:modelValue` - Tab change

**Example:**
```vue
<UTabButtons :items="['Tab 1', 'Tab 2']" v-model="activeTab" />
```

#### USplitter

Resizable panes (horizontal split).

**Props:**
- `defaultSize?: number` - Default left pane width in pixels (default: `200`)
- `min?: number` - Minimum left pane width (default: `100`)
- `max?: number` - Maximum left pane width

**Slots:**
- `left` - Left pane content
- `right` - Right pane content

**Example:**
```vue
<USplitter :defaultSize="300" :min="200" :max="600">
  <template #left>
    <div>Left content</div>
  </template>
  <template #right>
    <div>Right content</div>
  </template>
</USplitter>
```

#### UModal

Modal dialog component.

**Props:**
- `visible: boolean` - Modal visibility
- `title?: string` - Modal title

**Events:**
- `@close` - Close event

**Slots:**
- Default - Modal body content
- `footer` - Footer content

**Example:**
```vue
<UModal :visible="showModal" title="Confirm Action" @close="showModal = false">
  <p>Are you sure?</p>
  <template #footer>
    <UButton @click="confirm">Confirm</UButton>
    <UButton variant="ghost" @click="showModal = false">Cancel</UButton>
  </template>
</UModal>
```

#### UCard

Card container with optional title and subtitle.

**Props:**
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `padding?: boolean` - Enable padding (default: `true`)
- `hover?: boolean` - Hover effect (default: `false`)

**Slots:**
- Default - Card content
- `header` - Custom header content
- `footer` - Footer content

**Example:**
```vue
<UCard title="Settings" subtitle="Configure your preferences">
  <p>Card content</p>
</UCard>
```

### 7.3 Data Display Components

#### UJsonTree

JSON tree viewer with editing support.

**Props:**
- `data: unknown` - JSON data to display
- `editable?: boolean` - Enable editing (default: `false`)
- `deep?: number` - Max depth to expand (default: `3`)

**Example:**
```vue
<UJsonTree :data="{ name: 'John', age: 30 }" :editable="true" />
```

#### UCodeBlock

Code block with syntax highlighting (powered by Shiki).

**Props:**
- `code?: string` - Code content (or use default slot)
- `language?: string` - Programming language (default: `'text'`)
- `theme?: string` - Shiki theme (default: `'nord'`)

**Slots:**
- Default - Code content (if `code` prop not provided)
- `actions` - Action buttons (copy, etc.)

**Example:**
```vue
<UCodeBlock language="typescript" :code="codeString" />
<UCodeBlock language="javascript">
  const x = 10;
</UCodeBlock>
```

#### UKeyValue

Key-value pair display with copy functionality.

**Props:**
- `label: string` - Key label
- `value: string | number` - Value
- `copyable?: boolean` - Show copy button (default: `false`)
- `monospace?: boolean` - Use monospace font (default: `true`)

**Example:**
```vue
<UKeyValue label="API Key" value="sk-123..." :copyable="true" />
<UKeyValue label="Status" value="Active" />
```

#### UStat

Statistic card with colored backgrounds.

**Props:**
- `label: string` - Stat label
- `value: string | number` - Stat value
- `color?: 'indigo' | 'green' | 'blue' | 'purple' | 'red' | 'yellow'` - Color theme
- `size?: 'sm' | 'md' | 'lg'` - Size (default: `'md'`)

**Example:**
```vue
<UStat label="Total Requests" :value="1234" color="blue" />
<UStat label="Errors" :value="5" color="red" size="sm" />
```

#### UTreeView

Tree view component for hierarchical data.

**Props:**
- `data: TreeNode[]` - Tree data
- `nodeKey?: string` - Key field name (default: `'id'`)
- `childrenKey?: string` - Children field name (default: `'children'`)

**Slots:**
- `label` - Custom node label
  - Slot props: `{ node }`

**Example:**
```vue
<UTreeView :data="treeData">
  <template #label="{ node }">
    <span>{{ node.name }}</span>
  </template>
</UTreeView>
```

#### UDomNode

DOM node display component (for inspector plugins).

**Props:**
- `tagName: string` - HTML tag name
- `id?: string` - Element ID
- `classes?: string[]` - CSS classes
- `isCurrent?: boolean` - Is current selection
- `hasChildren?: boolean` - Has child elements

**Example:**
```vue
<UDomNode
  tagName="div"
  id="my-element"
  :classes="['container', 'flex']"
  :isCurrent="true"
/>
```

### 7.4 State Components

#### ULoading

Loading spinner with optional text.

**Props:**
- `text?: string` - Loading text
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: `'md'`)
- `fullscreen?: boolean` - Fullscreen overlay (default: `false`)

**Example:**
```vue
<ULoading text="Loading data..." />
<ULoading size="lg" fullscreen />
```

#### UEmpty

Empty state placeholder.

**Props:**
- `icon?: string` - Heroicons icon name
- `title?: string` - Title text
- `description?: string` - Description text
- `size?: 'sm' | 'md' | 'lg'` - Size (default: `'md'`)

**Example:**
```vue
<UEmpty icon="MagnifyingGlass" title="No results" description="Try a different search" />
<UEmpty title="Empty" description="No data available" />
```

### 7.5 Form Components

#### UForm

Form component that automatically generates inputs from a settings schema.

**Props:**
- `schema: Record<string, SettingSchemaDef>` - Settings schema
- `modelValue: Record<string, unknown>` - Form values

**Events:**
- `@update:modelValue` - Value change

**Example:**
```vue
<UForm
  :schema="{
    name: { label: 'Name', type: 'string', default: '' },
    age: { label: 'Age', type: 'number', default: 0 }
  }"
  v-model="formData"
/>
```

#### UArrayInput

Array input component for settings.

Used internally by `UForm` for array-type settings.

### 7.6 Virtual List

#### UVirtualList

Virtual scrolling list for large datasets.

**Props:**
- `items: T[]` - List items
- `itemHeight?: number` - Height of each item in pixels (default: `50`)
- `overscan?: number` - Number of items to render outside viewport (default: `5`)
- `keyField?: string | ((item: T) => string | number)` - Key field or function

**Events:**
- `@scroll` - Scroll event

**Slots:**
- Default - Item content
  - Slot props: `{ item, index }`

**Example:**
```vue
<UVirtualList :items="largeArray" :itemHeight="60">
  <template #default="{ item, index }">
    <div>{{ index }}: {{ item.name }}</div>
  </template>
</UVirtualList>
```

### 7.7 Styling

All components use CSS variables for theming:

- `--udt-bg-root` - Root background
- `--udt-bg-surface` - Surface background
- `--udt-text` - Primary text color
- `--udt-text-dim` - Dimmed text color
- `--udt-border` - Border color
- `--udt-border-subtle` - Subtle border color

Components automatically support dark mode. Use Tailwind CSS classes for additional styling.

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
