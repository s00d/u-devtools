[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/bridge](../README.md) / ViteRpcClient

# Class: ViteRpcClient

Defined in: [index.ts:9](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L9)

Client-side RPC implementation (Browser)
Works through import.meta.hot with fallback to WebSocket
Uses Transport abstraction for communication

## Constructors

### Constructor

> **new ViteRpcClient**(`hot?`, `wsUrl?`): `ViteRpcClient`

Defined in: [index.ts:14](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hot?` | \{ `off?`: (`event`, `handler`) => `void`; `on`: (`event`, `handler`) => `void`; `send`: (`event`, `data`) => `void`; \} |
| `hot.off?` | (`event`, `handler`) => `void` |
| `hot.on?` | (`event`, `handler`) => `void` |
| `hot.send?` | (`event`, `data`) => `void` |
| `wsUrl?` | `string` |

#### Returns

`ViteRpcClient`

## Methods

### call()

> **call**\<`T`\>(`method`, `payload?`): `Promise`\<`T`\>

Defined in: [index.ts:65](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L65)

Call a method on the server

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `method` | `string` | Method name to call |
| `payload?` | `unknown` | Optional payload to send |

#### Returns

`Promise`\<`T`\>

Promise with the method result

***

### dispose()

> **dispose**(): `void`

Defined in: [index.ts:112](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L112)

Clean up all handlers and subscriptions.
Should be called on HMR dispose to prevent memory leaks.

#### Returns

`void`

***

### off()

> **off**(`event`, `fn`): `void`

Defined in: [index.ts:101](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L101)

Unsubscribe from events

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name to unsubscribe from |
| `fn` | (`data`) => `void` | Event handler function to remove |

#### Returns

`void`

***

### on()

> **on**(`event`, `fn`): () => `void`

Defined in: [index.ts:89](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L89)

Subscribe to events (returns unsubscribe function)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name to subscribe to |
| `fn` | (`data`) => `void` | Event handler function |

#### Returns

Function to unsubscribe

> (): `void`

##### Returns

`void`
