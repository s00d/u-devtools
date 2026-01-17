[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/kit](../README.md) / [](../README.md) / AppPluginDefinition

# Interface: AppPluginDefinition

Defined in: [index.ts:40](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L40)

## Properties

### commands?

> `optional` **commands**: `object`[]

Defined in: [index.ts:66](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L66)

Declarative commands

#### action()

> **action**: (`ctx`) => `void` \| `Promise`\<`void`\>

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`AppContext`](AppContext.md) |

##### Returns

`void` \| `Promise`\<`void`\>

#### icon?

> `optional` **icon**: `string`

#### id

> **id**: `string`

#### label

> **label**: `string`

#### shortcut?

> `optional` **shortcut**: `string`[]

***

### component?

> `optional` **component**: `Component`

Defined in: [index.ts:44](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L44)

Vue component that will be rendered in the plugins layer (on top of the page)

***

### menu?

> `optional` **menu**: `object`

Defined in: [index.ts:55](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L55)

Declarative menu (required for plugins with UI in overlay)

#### action?

> `optional` **action**: `string` \| (`ctx`) => `void`

#### icon

> **icon**: `string`

#### id

> **id**: `string`

#### label

> **label**: `string`

#### order?

> `optional` **order**: `number`

***

### setup()?

> `optional` **setup**: (`context`) => `void` \| `Promise`\<`void`\>

Defined in: [index.ts:50](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L50)

Setup function (executed once on startup)
Here you can attach global listeners or register menu items

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`AppContext`](AppContext.md) |

#### Returns

`void` \| `Promise`\<`void`\>
