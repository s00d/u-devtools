[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / RpcClientInterface

# Interface: RpcClientInterface

Defined in: [index.ts:31](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L31)

RPC Client Interface for making remote procedure calls.
Provides methods to call server methods and subscribe to events.

Communication: Server ↔ Client via WebSocket (Vite HMR or custom WebSocket)

## Methods

### call()

> **call**\<`T`\>(`method`, `payload?`): `Promise`\<`T`\>

Defined in: [index.ts:39](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L39)

Call a remote method on the server.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `unknown` | Return type of the method |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `method` | `string` | Method name (e.g., 'sys:getPlugins') |
| `payload?` | `unknown` | Optional payload data |

#### Returns

`Promise`\<`T`\>

Promise that resolves with the method result

***

### off()?

> `optional` **off**(`event`, `callback`): `void`

Defined in: [index.ts:54](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L54)

Unsubscribe from events (optional, some transports may not support it).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `callback` | (`data`) => `void` | Callback function to remove |

#### Returns

`void`

***

### on()

> **on**(`event`, `callback`): () => `void`

Defined in: [index.ts:47](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L47)

Subscribe to events from the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `callback` | (`data`) => `void` | Callback function to handle events |

#### Returns

Function to unsubscribe from the event

> (): `void`

##### Returns

`void`
