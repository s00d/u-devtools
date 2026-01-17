[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / bindHtml

# Function: bindHtml()

> **bindHtml**(`element`, `state`): [`CleanupFn`](../type-aliases/CleanupFn.md)

Defined in: [vanilla.ts:44](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/vanilla.ts#L44)

Binds element HTML content to state.
element.innerHTML = state.value

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `HTMLElement` | HTMLElement |
| `state` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`any`\> | SyncedState instance |

## Returns

[`CleanupFn`](../type-aliases/CleanupFn.md)
