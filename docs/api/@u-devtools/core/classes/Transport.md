[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / Transport

# Abstract Class: Transport

Defined in: [transport.ts:14](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L14)

Abstract class for message transport.
Provides common logic for RPC calls and event subscriptions.

## Extended by

- [`HmrTransport`](HmrTransport.md)
- [`BroadcastTransport`](BroadcastTransport.md)
- [`WebSocketTransport`](WebSocketTransport.md)

## Constructors

### Constructor

> **new Transport**(): `Transport`

#### Returns

`Transport`

## Properties

### disposed

> `protected` **disposed**: `boolean` = `false`

Defined in: [transport.ts:20](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L20)

***

### eventListeners

> `protected` **eventListeners**: `Map`\<`string`, `Set`\<(`data`) => `void`\>\>

Defined in: [transport.ts:19](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L19)

***

### handlers

> `protected` **handlers**: `Map`\<`string`, \{ `reject`: (`error`) => `void`; `resolve`: (`value`) => `void`; \}\>

Defined in: [transport.ts:15](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L15)

***

### timeout

> `protected` **timeout**: `number` = `5000`

Defined in: [transport.ts:21](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L21)

## Methods

### call()

> **call**\<`T`\>(`method`, `payload?`): `Promise`\<`T`\>

Defined in: [transport.ts:41](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L41)

RPC method call

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `string` |
| `payload?` | `unknown` |

#### Returns

`Promise`\<`T`\>

***

### dispose()

> **dispose**(): `void`

Defined in: [transport.ts:160](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L160)

Clean up all handlers and subscriptions

#### Returns

`void`

***

### handleMessage()

> `protected` **handleMessage**(`data`): `void`

Defined in: [transport.ts:115](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L115)

Handle incoming messages (called by transport)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `unknown` |

#### Returns

`void`

***

### off()

> **off**(`event`, `fn`): `void`

Defined in: [transport.ts:105](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L105)

Unsubscribe from events

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `fn` | (`data`) => `void` |

#### Returns

`void`

***

### on()

> **on**(`event`, `fn`): () => `void`

Defined in: [transport.ts:77](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L77)

Subscribe to events

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `fn` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

***

### sendMessage()

> `abstract` `protected` **sendMessage**(`type`, `data`): `void`

Defined in: [transport.ts:26](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L26)

Send a message through the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `string` |
| `data` | `unknown` |

#### Returns

`void`

***

### subscribe()

> `abstract` `protected` **subscribe**(`type`, `handler`): () => `void`

Defined in: [transport.ts:31](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L31)

Subscribe to messages from the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `string` |
| `handler` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

***

### unsubscribe()?

> `abstract` `protected` `optional` **unsubscribe**(`type`, `handler`): `void`

Defined in: [transport.ts:36](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L36)

Unsubscribe from transport messages

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `string` |
| `handler` | (`data`) => `void` |

#### Returns

`void`
