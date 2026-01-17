# Packages

Universal DevTools Kit is organized as a monorepo with multiple packages, each serving a specific purpose. This page provides an overview of all available packages and their roles in the ecosystem.

## Core Packages

### @u-devtools/core
**Description:** Core types and interfaces for Universal DevTools.

**Purpose:** Defines the fundamental TypeScript interfaces, types, and contracts used throughout the DevTools ecosystem.

**Key Exports:**
- `RpcClientInterface` - RPC client interface
- `RpcServerInterface` - RPC server interface
- `ClientApi` - Client-side API interface
- `PluginClientInstance` - Plugin definition interface
- `DevToolsPlugin` - Plugin configuration interface
- Transport classes and event bus

**Documentation:** [API Reference](/api/@u-devtools/core/README)

---

### @u-devtools/kit
**Description:** SDK for creating Universal DevTools plugins.

**Purpose:** Provides utilities, helpers, and framework adapters for plugin development.

**Key Exports:**
- `definePlugin()` - Plugin definition helper
- `defineApp()` - App context plugin helper
- `createDevToolsContext()` - Context factory
- Framework adapters (Vue, React, Svelte, Solid, Lit, Vanilla)
- Web Components utilities

**Documentation:** [API Reference](/api/@u-devtools/kit/README)

---

### @u-devtools/vite
**Description:** Universal DevTools Kit for Vite applications.

**Purpose:** Main Vite plugin that integrates DevTools into your Vite project.

**Key Features:**
- Automatic DevTools injection
- Plugin loading and management
- WebSocket server setup
- Virtual module resolution
- Build-time asset generation

**Documentation:** [API Reference](/api/@u-devtools/vite/README)

---

## Communication Packages

### @u-devtools/bridge
**Description:** RPC bridge for Universal DevTools communication.

**Purpose:** Implements the communication layer between Server and Client contexts using WebSocket.

**Key Features:**
- WebSocket-based RPC
- Event broadcasting
- Request/response handling
- Error handling and timeouts

**Documentation:** [API Reference](/api/@u-devtools/bridge/README)

---

## UI Packages

### @u-devtools/client
**Description:** Client-side UI shell for Universal DevTools.

**Purpose:** The main DevTools UI that runs in an isolated iframe, providing the shell, navigation, and plugin rendering infrastructure.

**Key Features:**
- DevTools shell UI
- Plugin panel rendering
- Command palette
- Settings management
- Activity bar and navigation

**Documentation:** [API Reference](/api/@u-devtools/client/README)

---

### @u-devtools/overlay
**Description:** Overlay UI components and utilities for injecting DevTools into the application window.

**Purpose:** Provides the floating DevTools button, overlay container, and utilities for App context integration.

**Key Features:**
- Floating DevTools button
- Overlay container management
- Toast notifications
- Element highlighting utilities
- Shadow DOM integration

**Documentation:** [API Reference](/api/@u-devtools/overlay/README)

---

### @u-devtools/ui
**Description:** Reusable UI component library for building plugin interfaces.

**Purpose:** Pre-built Vue components with dark theme support for consistent plugin UIs.

**Key Components:**
- Form components (Input, Select, Textarea, etc.)
- Layout components (Modal, Splitter, TabButtons, etc.)
- Data display (Table, TreeView, JsonTree, CodeBlock, etc.)
- Utility components (Badge, Stat, Empty, etc.)

**Documentation:** [API Reference](/api/@u-devtools/ui/README)

---

## Utility Packages

### @u-devtools/utils
**Description:** Shared utility functions for browser environments.

**Purpose:** Common utilities used across Client and App contexts.

**Key Features:**
- Color manipulation
- JSON utilities
- Path utilities
- Serialization helpers
- Error handling

**Documentation:** [API Reference](/api/@u-devtools/utils/README)

---

### @u-devtools/utils-node
**Description:** Node.js-specific utility functions.

**Purpose:** Utilities for Server context that require Node.js APIs.

**Key Features:**
- File system operations
- Path normalization
- Package manager detection
- Cross-platform path handling

**Documentation:** [API Reference](/api/@u-devtools/utils-node/README)

---

## Tooling Packages

### create-u-devtools
**Description:** CLI tool to scaffold Universal DevTools plugins.

**Purpose:** Generator for creating new plugins with boilerplate code and examples.

**Key Features:**
- Interactive plugin generator
- Framework template selection
- Feature scaffolding
- Project structure generation

**Documentation:** [API Reference](/api/create-u-devtools/README)

---

### @u-devtools/electron
**Description:** Electron wrapper for Universal DevTools Kit.

**Purpose:** Enables DevTools to work in Electron applications.

**Key Features:**
- Electron integration
- Main process plugin host
- Renderer process communication
- File system access in Electron

**Documentation:** [API Reference](/api/@u-devtools/electron/README)

---

## Package Relationships

```
@u-devtools/vite (Main Plugin)
├── @u-devtools/client (UI Shell)
│   ├── @u-devtools/ui (Components)
│   ├── @u-devtools/kit (SDK)
│   └── @u-devtools/core (Types)
├── @u-devtools/overlay (Overlay UI)
│   ├── @u-devtools/ui (Components)
│   └── @u-devtools/core (Types)
├── @u-devtools/bridge (RPC)
│   └── @u-devtools/core (Types)
└── Plugins
    ├── @u-devtools/kit (SDK)
    ├── @u-devtools/core (Types)
    ├── @u-devtools/ui (Components)
    └── @u-devtools/utils (Utilities)
```

## Installation

### Core Packages (Required)

```bash
pnpm add -D @u-devtools/vite @u-devtools/client @u-devtools/overlay
```

### Development Packages (For Plugin Development)

```bash
pnpm add -D @u-devtools/kit @u-devtools/core @u-devtools/ui
```

### Utility Packages (As Needed)

```bash
pnpm add -D @u-devtools/utils @u-devtools/utils-node
```

## Package Versions

All packages follow semantic versioning and are published together. Check the [API Reference](/api/packages) for the latest versions and detailed documentation.
