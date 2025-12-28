# @u-devtools/plugin-vite-inspector

Powerful system plugin for Universal DevTools that provides deep insights into Vite configuration and server management.

## Features

### Dashboard
- Vite version and Node.js version
- Development/Production mode
- Local and network URLs
- Config file location with quick open
- Cache directory path

### Config Viewer
- View resolved Vite configuration (after all merges and resolves)
- JSON tree view of all settings
- Sanitized output (plugins excluded, shown separately)

### Plugins List
- List of all active Vite plugins
- Execution order (pre → normal → post)
- Plugin hooks and apply conditions
- Essential for debugging plugin conflicts

### Environment Variables
- View all `VITE_*` environment variables
- See what's actually loaded and available to your app
- Environment audit for debugging

### Actions

#### 🔄 Restart Server
Restart the Vite dev server directly from the browser. Useful when HMR gets stuck.

#### 🗑️ Clear Cache
Force clear the `.vite` cache directory. This forces a full rebuild and often fixes:
- Stale dependency caching
- Plugin configuration issues
- Build artifacts not updating

## Installation

The plugin is included when you use `@u-devtools/vite`. Add it to your Vite config:

```typescript
import { createDevTools } from '@u-devtools/vite';
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';

export default defineConfig({
  plugins: [
    vue(),
    createDevTools({
      plugins: [
        viteInspectorPlugin()
      ]
    })
  ]
});
```

## Usage

1. Open DevTools (click the 🛠 button)
2. Select the "Vite Inspector" tab
3. Navigate between tabs:
   - **Dashboard**: Overview and quick actions
   - **Config**: Full resolved configuration
   - **Plugins**: Plugin execution order
   - **Env**: Environment variables

## Why This Plugin is Powerful

### Deep Dive
You see not just "it works", but exactly how Vite is configured. The resolved config shows the final merged configuration after all plugins and defaults.

### Plugin Debugging
If styles aren't applying or plugins conflict, the "Plugins" tab shows the exact execution order. This is crucial for understanding why certain plugins run before others.

### Emergency Controls
The "Clear Cache" button saves you when Vite caches stale dependencies and a normal restart doesn't help. It's a nuclear option that forces a complete rebuild.

### Environment Audit
See exactly which environment variables are loaded and available to your application, helping debug configuration issues.

## Universal Plugin

This plugin is **universal** and works with any Vite-based project, regardless of framework (Vue, React, Svelte, etc.).

