[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/ui](../README.md) / useResizable

# Function: useResizable()

> **useResizable**(`sizeRef`, `options`): `object`

Defined in: [composables/useResizable.ts:33](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L33)

Универсальный composable для ресайза элементов.
Поддерживает как вертикальный (height), так и горизонтальный (width) ресайз.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `sizeRef` | `Ref`\<`number`\> |
| `options` | [`UseResizableOptions`](../interfaces/UseResizableOptions.md) |

## Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `isResizing` | `Ref`\<`boolean`, `boolean`\> | [composables/useResizable.ts:114](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L114) |
| `onPointerDown()` | (`e`) => `void` | [composables/useResizable.ts:115](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L115) |
