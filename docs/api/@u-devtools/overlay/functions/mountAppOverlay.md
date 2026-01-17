[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/overlay](../README.md) / [](../README.md) / mountAppOverlay

# Function: mountAppOverlay()

> **mountAppOverlay**(`component`, `props`): `Promise`\<() => `void`\>

Defined in: [overlay.ts:14](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/overlay/src/overlay.ts#L14)

Mount a Vue component into the plugins overlay layer.

Styles are automatically available from the shared style context
in the overlay's Shadow DOM (Tailwind + UI Kit loaded once).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `component` | `Component` | Vue component to mount |
| `props` | `Record`\<`string`, `any`\> | Props to pass to the component |

## Returns

`Promise`\<() => `void`\>

Unmount function to clean up
