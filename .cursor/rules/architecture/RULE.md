---
description: "Universal DevTools Kit architecture: three execution contexts (Server/Client/App), RPC communication, and plugin structure"
alwaysApply: true
---

# Universal DevTools Kit Architecture

## Three Execution Contexts

1. **Server (Node.js)** - Runs in Vite Dev Server process
   - File system access
   - Vite config access
   - Terminal commands
   - Database operations
   - Package management

2. **Client (Iframe)** - Isolated Vue 3 application
   - Plugin UI rendering
   - State management
   - User interactions
   - Settings and storage management

3. **App (Window)** - Scripts injected into main application
   - Network interception
   - DOM inspection
   - Global object patching (console, fetch, etc.)
   - Runtime state inspection

## Communication

- **Server ↔ Client**: RPC over WebSocket (Vite HMR)
- **App ↔ Client**: BroadcastChannel API

## Package Structure

- `@u-devtools/core` - Interfaces and types
- `@u-devtools/bridge` - RPC bridge (ViteRpcClient/ViteRpcServer)
- `@u-devtools/ui` - Vue UI components
- `@u-devtools/client` - DevTools shell (Vue 3 app)
- `@u-devtools/vite` - Vite plugin integration
- `@u-devtools/kit` - SDK for creating plugins (`definePlugin` helper)
- `@u-devtools/overlay` - DevTools overlay launcher
- `@u-devtools/utils` - Browser utility functions
- `@u-devtools/utils-node` - Node.js utility functions

## Plugin Structure

Each plugin has:
- `index.ts` - Exports plugin using `definePlugin` helper
- `client.ts` - Exports `PluginClientInstance` (default export)
- `server.ts` - (Optional) Server-side RPC handlers
- `app.ts` - (Optional) Window injection script with HMR cleanup
- `ui/*.vue` - Vue components using `@u-devtools/ui`

## Key Principles

- Plugins are isolated (separate storage/settings scope)
- Always implement HMR cleanup in `app.ts`
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- All code, comments, and documentation must be in English
