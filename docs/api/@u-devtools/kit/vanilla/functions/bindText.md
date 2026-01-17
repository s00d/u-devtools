[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / bindText

# Function: bindText()

> **bindText**(`element`, `state`): [`CleanupFn`](../type-aliases/CleanupFn.md)

Defined in: [vanilla.ts:28](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/vanilla.ts#L28)

Binds element text content to state.
element.textContent = state.value

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `HTMLElement` \| `Text` | HTMLElement or Text node |
| `state` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`any`\> | SyncedState instance |

## Returns

[`CleanupFn`](../type-aliases/CleanupFn.md)
