[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/overlay](../README.md) / useElementRect

# Function: useElementRect()

> **useElementRect**(`elementRef`): `object`

Defined in: [composables/useElementRect.ts:24](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/overlay/src/composables/useElementRect.ts#L24)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `elementRef` | \{ `value`: `HTMLElement` \| `null`; \} |
| `elementRef.value` | `HTMLElement` \| `null` |

## Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `isVisible` | `Ref`\<`boolean`, `boolean`\> | [composables/useElementRect.ts:85](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/overlay/src/composables/useElementRect.ts#L85) |
| `rect` | `Ref`\<\{ `borderBottom`: `number`; `borderLeft`: `number`; `borderRight`: `number`; `borderTop`: `number`; `height`: `number`; `left`: `number`; `marginBottom`: `number`; `marginLeft`: `number`; `marginRight`: `number`; `marginTop`: `number`; `paddingBottom`: `number`; `paddingLeft`: `number`; `paddingRight`: `number`; `paddingTop`: `number`; `top`: `number`; `width`: `number`; \} \| `null`, [`ElementRect`](../interfaces/ElementRect.md) \| \{ `borderBottom`: `number`; `borderLeft`: `number`; `borderRight`: `number`; `borderTop`: `number`; `height`: `number`; `left`: `number`; `marginBottom`: `number`; `marginLeft`: `number`; `marginRight`: `number`; `marginTop`: `number`; `paddingBottom`: `number`; `paddingLeft`: `number`; `paddingRight`: `number`; `paddingTop`: `number`; `top`: `number`; `width`: `number`; \} \| `null`\> | [composables/useElementRect.ts:85](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/overlay/src/composables/useElementRect.ts#L85) |
