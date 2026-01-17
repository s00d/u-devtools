[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / EventBusApi

# Interface: EventBusApi

Defined in: [index.ts:194](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L194)

## Methods

### emit()

> **emit**(`event`, `data?`): `void`

Defined in: [index.ts:200](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L200)

Emit an event.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `data?` | `unknown` | Event data |

#### Returns

`void`

***

### off()

> **off**(`event`, `handler`): `void`

Defined in: [index.ts:215](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L215)

Unsubscribe from an event.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `handler` | (`data`) => `void` | Event handler |

#### Returns

`void`

***

### on()

> **on**(`event`, `handler`): () => `void`

Defined in: [index.ts:208](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L208)

Subscribe to an event.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `handler` | (`data`) => `void` | Event handler |

#### Returns

Function to unsubscribe

> (): `void`

##### Returns

`void`
