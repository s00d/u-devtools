[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / bindAttr

# Function: bindAttr()

> **bindAttr**(`element`, `state`, `attrName`): [`CleanupFn`](../type-aliases/CleanupFn.md)

Defined in: [vanilla.ts:101](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/vanilla.ts#L101)

Binds element attribute to state.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `HTMLElement` | HTMLElement |
| `state` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`any`\> | SyncedState instance |
| `attrName` | `string` | Attribute name |

## Returns

[`CleanupFn`](../type-aliases/CleanupFn.md)
