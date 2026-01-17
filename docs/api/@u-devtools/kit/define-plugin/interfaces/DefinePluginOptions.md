[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [define-plugin](../README.md) / DefinePluginOptions

# Interface: DefinePluginOptions

Defined in: [define-plugin.ts:30](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L30)

Options for defining a DevTools plugin using the `definePlugin` helper.

This is the recommended way to create plugins as it handles path resolution
automatically for both development (.ts) and production (.js) modes.

## Example

```typescript
import { definePlugin } from '@u-devtools/kit/define-plugin';

export default definePlugin({
  name: 'My Plugin',
  root: import.meta.url,  // Required: pass import.meta.url
  client: './client',     // Relative to this file
  app: './app',           // Optional
  server: './server',     // Optional
  meta: {
    name: '@my-org/my-plugin',
    version: '1.0.0',
    description: 'My custom DevTools plugin',
    repository: 'https://github.com/my-org/my-plugin',
  },
});
```

## Properties

### app?

> `optional` **app**: `string` \| `null`

Defined in: [define-plugin.ts:57](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L57)

Relative path to app file (with or without extension).

#### Example

```ts
'./app' or './app.ts'

If `null` is passed, app file will not be loaded.
The app file should export a `AppPluginDefinition` using `defineApp`.
```

***

### client?

> `optional` **client**: `string` \| `null`

Defined in: [define-plugin.ts:48](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L48)

Relative path to client file (with or without extension).

#### Default

```ts
'./client'
```

#### Example

```ts
'./client' or './client.ts'

If `null` is passed, client file will not be loaded.
The client file should export a `PluginClientInstance` as default.
```

***

### meta?

> `optional` **meta**: [`PluginMetadata`](../../../core/interfaces/PluginMetadata.md)

Defined in: [define-plugin.ts:71](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L71)

Plugin metadata (name, version, description, author, homepage, repository)

***

### name

> **name**: `string`

Defined in: [define-plugin.ts:32](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L32)

Display name of the plugin (shown in DevTools UI)

***

### root

> **root**: `string`

Defined in: [define-plugin.ts:38](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L38)

Must pass `import.meta.url` so we can resolve paths.
This is used to determine the plugin's directory and resolve relative paths.

***

### server?

> `optional` **server**: `string` \| `null`

Defined in: [define-plugin.ts:68](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L68)

Relative path to server file (with or without extension).
If specified, will be automatically loaded and `setupServer` export will be called.

#### Default

```ts
'./server'
```

#### Example

```ts
'./server' or './node'

If `null` is passed, server file will not be loaded.
The server file should export a `setupServer` function.
```

***

### useDist?

> `optional` **useDist**: `boolean`

Defined in: [define-plugin.ts:86](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L86)

Force use production paths (dist/file.js) even in dev mode.
Useful for debugging built plugin version.

#### Default

```ts
false
```

***

### vitePlugins?

> `optional` **vitePlugins**: () => `any`[]

Defined in: [define-plugin.ts:79](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/define-plugin.ts#L79)

Vite plugins to inject into the dev server.
These plugins will be merged with the main DevTools plugin.

Uses `any` to avoid type conflicts between different vite installations in monorepo.

#### Returns

`any`
