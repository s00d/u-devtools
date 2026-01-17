[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-manager

# @u-devtools/plugin-manager

Plugin Manager for Universal DevTools. Allows you to browse, install, and manage DevTools plugins from npm.

## Installation

```bash
npm install -D @u-devtools/plugin-manager
```

## Usage

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { pluginManager } from '@u-devtools/plugin-manager';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        pluginManager(), // 👈 Add plugin manager
        // ... other plugins
      ],
    }),
  ],
});
```

## Features

- **Browse Marketplace**: Search for plugins on npm using keywords
- **Install Plugins**: Automatically install plugins and update `vite.config.ts`
- **Uninstall Plugins**: Remove plugins from your project
- **Check Updates**: See if newer versions of installed plugins are available
- **Plugin List**: View all installed plugins with their metadata

## How It Works

The Plugin Manager is itself a plugin, demonstrating the extensibility of the Universal DevTools system. It:

1. Uses `generalMenuItems` API to add an "Extensions" item to the General menu
2. Provides RPC handlers for plugin management operations
3. Uses `magicast` to automatically modify `vite.config.ts` when installing plugins

## API

The plugin provides the following RPC methods:

- `manager:search` - Search for plugins on npm
- `manager:install` - Install a plugin package
- `manager:uninstall` - Uninstall a plugin package
- `manager:checkUpdates` - Check for available updates

## License

MIT

## Variables

- [plugin](variables/plugin.md)

## Functions

- [pluginManager](functions/pluginManager.md)
