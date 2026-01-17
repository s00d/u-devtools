[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / DevToolsPlugin

# Interface: DevToolsPlugin

Defined in: [index.ts:603](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L603)

DevTools Plugin Definition - Server-side plugin configuration.
Defines a plugin's structure and entry points for all three execution contexts.

Created using definePlugin() helper from @u-devtools/kit/define-plugin.

## Example

```ts
import { definePlugin } from '@u-devtools/kit/define-plugin';

export default definePlugin({
  name: 'My Plugin',
  root: import.meta.url,
  client: './client',
  app: './app',
  server: './server',
});
```

## Properties

### appPath?

> `optional` **appPath**: `string`

Defined in: [index.ts:609](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L609)

Absolute path to app.ts file (App context - main window)

***

### clientPath?

> `optional` **clientPath**: `string`

Defined in: [index.ts:607](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L607)

Absolute path to client.ts file (Client context)

***

### meta?

> `optional` **meta**: [`PluginMetadata`](PluginMetadata.md)

Defined in: [index.ts:618](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L618)

Plugin metadata (name, version, description, etc.)

***

### name

> **name**: `string`

Defined in: [index.ts:605](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L605)

Display name of the plugin

***

### setupServer()?

> `optional` **setupServer**: (`rpc`, `ctx`) => `void`

Defined in: [index.ts:616](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L616)

Server-side setup function (Server context - Node.js).
Called when plugin is loaded to register RPC handlers.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rpc` | [`RpcServerInterface`](RpcServerInterface.md) | RPC server interface for handling requests |
| `ctx` | [`ServerContext`](ServerContext.md) | Server context with root path and Vite server instance |

#### Returns

`void`

***

### vitePlugins?

> `optional` **vitePlugins**: () => `PluginOption` \| `PluginOption`[][]

Defined in: [index.ts:623](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L623)

Optional Vite plugins to be merged with the main DevTools plugin.
These plugins will be added to the Vite configuration.

#### Returns

`PluginOption` \| `PluginOption`[]
