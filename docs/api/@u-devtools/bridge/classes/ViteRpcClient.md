[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/bridge](../README.md) / ViteRpcClient

# Class: ViteRpcClient

Defined in: [index.ts:9](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L9)

Client-side RPC implementation (Browser)
Works through import.meta.hot with fallback to WebSocket
Uses Transport abstraction for communication

## Constructors

### Constructor

> **new ViteRpcClient**(`hot?`, `wsUrl?`): `ViteRpcClient`

Defined in: [index.ts:14](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L14)

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

Defined in: [index.ts:69](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L69)

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

Defined in: [index.ts:116](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L116)

Clean up all handlers and subscriptions.
Should be called on HMR dispose to prevent memory leaks.

#### Returns

`void`

***

### off()

> **off**(`event`, `fn`): `void`

Defined in: [index.ts:105](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L105)

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

Defined in: [index.ts:93](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L93)

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
