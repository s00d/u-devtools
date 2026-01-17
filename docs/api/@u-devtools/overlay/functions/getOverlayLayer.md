[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/overlay](../README.md) / [](../README.md) / getOverlayLayer

# Function: getOverlayLayer()

> **getOverlayLayer**(`layer`): `Promise`\<`HTMLElement`\>

Defined in: [overlay-utils.ts:70](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/overlay/src/overlay-utils.ts#L70)

Get a specific overlay layer container.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `layer` | [`OverlayLayer`](../type-aliases/OverlayLayer.md) | `'plugins'` | Layer name (default: 'plugins') |

## Returns

`Promise`\<`HTMLElement`\>

Promise that resolves with the layer container element
