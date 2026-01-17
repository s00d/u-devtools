[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [define-plugin](../README.md) / definePlugin

# Function: definePlugin()

> **definePlugin**(`options`): [`DevToolsPlugin`](../../../core/interfaces/DevToolsPlugin.md)

Defined in: [define-plugin.ts:122](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L122)

Smart factory for creating DevTools plugins.

Automatically resolves paths for Dev (.ts) and Prod (.js) modes.
Handles path resolution, file loading, and server setup automatically.

**⚠️ Important:** This function uses Node.js APIs (`node:url`, `node:path`) 
and should only be called in server-side code (Vite plugin context).

Import from `@u-devtools/kit/define-plugin` (not from `@u-devtools/kit`).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DefinePluginOptions`](../interfaces/DefinePluginOptions.md) | Plugin configuration options |

## Returns

[`DevToolsPlugin`](../../../core/interfaces/DevToolsPlugin.md)

Configured `DevToolsPlugin` object

## Example

```ts
// In your plugin's index.ts (server-side)
import { definePlugin } from '@u-devtools/kit/define-plugin';

export default definePlugin({
  name: 'My Plugin',
  root: import.meta.url,  // Required!
  client: './client',      // Optional, defaults to './client'
  app: './app',            // Optional
  server: './server',      // Optional, defaults to './server'
  meta: {
    name: '@my-org/my-plugin',
    version: '1.0.0',
    description: 'My custom DevTools plugin'
  }
});
```
