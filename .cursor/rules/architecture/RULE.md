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

2. **Client (Iframe)** - Isolated Vue 3 application
   - Plugin UI rendering
   - State management
   - User interactions

3. **App (Window)** - Scripts injected into main application
   - Network interception
   - DOM inspection
   - Global object patching (console, fetch, etc.)

## Communication

- **Server ↔ Client**: RPC over WebSocket (Vite HMR)
- **App ↔ Client**: BroadcastChannel API

## Package Structure

- `@u-devtools/core` - Interfaces and types
- `@u-devtools/bridge` - RPC bridge (ViteRpcClient/ViteRpcServer)
- `@u-devtools/ui` - Vue UI components
- `@u-devtools/client` - DevTools shell (Vue 3 app)
- `@u-devtools/vite` - Vite plugin integration

## Plugin Structure

Each plugin has:
- `index.ts` - Exports `DevToolsPlugin`
- `server.ts` - (Optional) Server-side logic
- `client.ts` - Exports `PluginClientInstance`
- `app.ts` - (Optional) Window injection script
- `ui/*.vue` - Vue components

## Key Principles

- Plugins are isolated (separate storage/settings scope)
- Always implement HMR cleanup in `app.ts`
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns

