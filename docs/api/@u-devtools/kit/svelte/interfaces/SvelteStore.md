[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [svelte](../README.md) / SvelteStore

# Interface: SvelteStore\<T\>

Defined in: [svelte.ts:6](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/svelte.ts#L6)

Svelte Store interface (compatible with Svelte's store contract)

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Properties

### set()

> **set**: (`value`) => `void`

Defined in: [svelte.ts:8](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/svelte.ts#L8)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |

#### Returns

`void`

***

### subscribe()

> **subscribe**: (`run`) => () => `void`

Defined in: [svelte.ts:7](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/svelte.ts#L7)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `run` | (`value`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

***

### update()

> **update**: (`fn`) => `void`

Defined in: [svelte.ts:9](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/svelte.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`) => `T` |

#### Returns

`void`
