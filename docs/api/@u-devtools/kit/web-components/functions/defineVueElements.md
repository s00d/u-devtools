[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [web-components](../README.md) / defineVueElements

# Function: defineVueElements()

> **defineVueElements**(`definitions`): `void`

Defined in: [web-components.ts:365](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/web-components.ts#L365)

Helper to register multiple Vue components as Web Components

## Parameters

| Parameter | Type |
| ------ | ------ |
| `definitions` | `object`[] |

## Returns

`void`

## Example

```ts
import { defineVueElements } from '@u-devtools/kit';

defineVueElements([
  { tagName: 'u-button', component: UButton, options: { attributes: ['label'], emits: ['click'] } },
  { tagName: 'u-card', component: UCard, options: { attributes: ['title'] } },
]);
```
