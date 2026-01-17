[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / bindStyle

# Function: bindStyle()

> **bindStyle**(`element`, `state`, `property`): [`CleanupFn`](../type-aliases/CleanupFn.md)

Defined in: [vanilla.ts:168](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/vanilla.ts#L168)

Style binding.
element.style[property] = state.value

## Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `HTMLElement` |
| `state` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`any`\> |
| `property` | keyof `CSSStyleDeclaration` |

## Returns

[`CleanupFn`](../type-aliases/CleanupFn.md)
