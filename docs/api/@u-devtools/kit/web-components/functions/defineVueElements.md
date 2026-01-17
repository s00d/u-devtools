[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [web-components](../README.md) / defineVueElements

# Function: defineVueElements()

> **defineVueElements**(`definitions`): `void`

Defined in: [web-components.ts:365](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/web-components.ts#L365)

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
