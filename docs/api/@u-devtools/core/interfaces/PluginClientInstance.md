[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / PluginClientInstance

# Interface: PluginClientInstance

Defined in: [index.ts:478](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L478)

Plugin Client Instance - Definition of a plugin's UI and behavior in Client context.
This is the main export from a plugin's client.ts file.

## Example

```ts
import type { PluginClientInstance } from '@u-devtools/core';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube',
  settings: { },
  commands: [ ],
  renderMain(container, api) {
    // Render your plugin UI
    return () => { };
  }
};

export default plugin;
```

## Properties

### commands?

> `optional` **commands**: [`PluginCommand`](PluginCommand.md)[]

Defined in: [index.ts:494](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L494)

Commands accessible via Command Palette (Cmd+K / Ctrl+K)

***

### generalMenuItems?

> `optional` **generalMenuItems**: [`GeneralMenuItem`](GeneralMenuItem.md)[]

Defined in: [index.ts:500](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L500)

Menu items for the "General" section in ActivityBar.
Allows plugins to add their actions to the general menu.

***

### hideFromMenu?

> `optional` **hideFromMenu**: `boolean`

Defined in: [index.ts:488](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L488)

Hide plugin from main ActivityBar menu.
Plugin will still be accessible via navigation API or generalMenuItems.

***

### icon

> **icon**: `string`

Defined in: [index.ts:482](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L482)

Heroicons icon name (e.g., 'Cube', 'MagnifyingGlass', 'WrenchScrewdriver')

***

### name

> **name**: `string`

Defined in: [index.ts:480](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L480)

Display name shown in DevTools UI

***

### renderMain()?

> `optional` **renderMain**: (`el`, `api`, `options`) => [`UnmountFn`](../type-aliases/UnmountFn.md)

Defined in: [index.ts:519](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L519)

Render main panel (optional).
This is the primary UI for your plugin.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `el` | `HTMLElement` | Container element to render into |
| `api` | [`ClientApi`](ClientApi.md) | Client API for plugin functionality |
| `options` | \{ `bridge`: [`AppBridge`](../classes/AppBridge.md)\<`any`\>; \} | Additional options including AppBridge |
| `options.bridge` | [`AppBridge`](../classes/AppBridge.md)\<`any`\> | - |

#### Returns

[`UnmountFn`](../type-aliases/UnmountFn.md)

Cleanup function called when plugin is unmounted

***

### renderSettings()?

> `optional` **renderSettings**: (`el`, `api`, `options`) => [`UnmountFn`](../type-aliases/UnmountFn.md)

Defined in: [index.ts:529](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L529)

Render custom settings UI (optional).
If not provided, settings will use the default form based on settings schema.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `el` | `HTMLElement` | Container element to render into |
| `api` | [`ClientApi`](ClientApi.md) | Client API for plugin functionality |
| `options` | \{ `bridge`: [`AppBridge`](../classes/AppBridge.md)\<`any`\>; \} | Additional options including AppBridge |
| `options.bridge` | [`AppBridge`](../classes/AppBridge.md)\<`any`\> | - |

#### Returns

[`UnmountFn`](../type-aliases/UnmountFn.md)

Cleanup function called when plugin is unmounted

***

### renderSidebar()?

> `optional` **renderSidebar**: (`el`, `api`, `options`) => [`UnmountFn`](../type-aliases/UnmountFn.md)

Defined in: [index.ts:509](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L509)

Render sidebar panel (optional).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `el` | `HTMLElement` | Container element to render into |
| `api` | [`ClientApi`](ClientApi.md) | Client API for plugin functionality |
| `options` | \{ `bridge`: [`AppBridge`](../classes/AppBridge.md)\<`any`\>; \} | Additional options including AppBridge |
| `options.bridge` | [`AppBridge`](../classes/AppBridge.md)\<`any`\> | - |

#### Returns

[`UnmountFn`](../type-aliases/UnmountFn.md)

Cleanup function called when plugin is unmounted

***

### settings?

> `optional` **settings**: [`PluginSettingsSchema`](PluginSettingsSchema.md)

Defined in: [index.ts:491](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L491)

Settings schema for user-configurable options
