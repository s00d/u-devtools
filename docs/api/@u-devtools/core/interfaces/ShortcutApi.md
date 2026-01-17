[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / ShortcutApi

# Interface: ShortcutApi

Defined in: [index.ts:169](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L169)

## Methods

### register()

> **register**(`keys`, `action`): () => `void`

Defined in: [index.ts:176](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L176)

Register a keyboard shortcut.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `keys` | `string`[] | Array of keys (e.g., ['Meta', 'K']) |
| `action` | () => `void` | Action to execute on key press |

#### Returns

Function to unregister the shortcut

> (): `void`

##### Returns

`void`
