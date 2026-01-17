[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/overlay](../README.md) / getOverlayLayer

# Function: getOverlayLayer()

> **getOverlayLayer**(`layer`): `Promise`\<`HTMLElement`\>

Defined in: [overlay-utils.ts:70](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/overlay/src/overlay-utils.ts#L70)

Get a specific overlay layer container.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `layer` | [`OverlayLayer`](../type-aliases/OverlayLayer.md) | `'plugins'` | Layer name (default: 'plugins') |

## Returns

`Promise`\<`HTMLElement`\>

Promise that resolves with the layer container element
