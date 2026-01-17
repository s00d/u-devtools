[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / bindInput

# Function: bindInput()

> **bindInput**(`element`, `state`): [`CleanupFn`](../type-aliases/CleanupFn.md)

Defined in: [vanilla.ts:124](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/vanilla.ts#L124)

Two-way binding for input, textarea, select elements.
state -> input.value
input event -> state.value

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `HTMLInputElement` \| `HTMLTextAreaElement` \| `HTMLSelectElement` | HTMLInputElement, HTMLTextAreaElement, or HTMLSelectElement |
| `state` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`any`\> | SyncedState instance |

## Returns

[`CleanupFn`](../type-aliases/CleanupFn.md)
