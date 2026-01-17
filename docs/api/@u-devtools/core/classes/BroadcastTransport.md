[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / BroadcastTransport

# Class: BroadcastTransport

Defined in: [transports/broadcast-transport.ts:8](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L8)

Transport based on BroadcastChannel
Used for communication between App (window) and Client (iframe)
Does not support RPC (call), only events (send/on)

## Extends

- [`Transport`](Transport.md)

## Constructors

### Constructor

> **new BroadcastTransport**(`namespace`): `BroadcastTransport`

Defined in: [transports/broadcast-transport.ts:13](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L13)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `string` |

#### Returns

`BroadcastTransport`

#### Overrides

[`Transport`](Transport.md).[`constructor`](Transport.md#constructor)

## Properties

### disposed

> `protected` **disposed**: `boolean` = `false`

Defined in: [transport.ts:20](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L20)

#### Inherited from

[`Transport`](Transport.md).[`disposed`](Transport.md#disposed)

***

### eventListeners

> `protected` **eventListeners**: `Map`\<`string`, `Set`\<(`data`) => `void`\>\>

Defined in: [transport.ts:19](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L19)

#### Inherited from

[`Transport`](Transport.md).[`eventListeners`](Transport.md#eventlisteners)

***

### handlers

> `protected` **handlers**: `Map`\<`string`, \{ `reject`: (`error`) => `void`; `resolve`: (`value`) => `void`; \}\>

Defined in: [transport.ts:15](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L15)

#### Inherited from

[`Transport`](Transport.md).[`handlers`](Transport.md#handlers)

***

### timeout

> `protected` **timeout**: `number` = `5000`

Defined in: [transport.ts:21](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L21)

#### Inherited from

[`Transport`](Transport.md).[`timeout`](Transport.md#timeout)

## Methods

### call()

> **call**\<`T`\>(`_method`, `_payload?`): `Promise`\<`T`\>

Defined in: [transports/broadcast-transport.ts:127](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L127)

RPC calls are not supported in BroadcastChannel

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_method` | `string` |
| `_payload?` | `unknown` |

#### Returns

`Promise`\<`T`\>

#### Overrides

[`Transport`](Transport.md).[`call`](Transport.md#call)

***

### close()

> **close**(): `void`

Defined in: [transports/broadcast-transport.ts:171](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L171)

Close channel (alias for dispose)

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [transports/broadcast-transport.ts:163](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L163)

Clean up all handlers and subscriptions

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`dispose`](Transport.md#dispose)

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

#### Inherited from

[`Transport`](Transport.md).[`handleMessage`](Transport.md#handlemessage)

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

#### Inherited from

[`Transport`](Transport.md).[`off`](Transport.md#off)

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

#### Inherited from

[`Transport`](Transport.md).[`on`](Transport.md#on)

***

### send()

> **send**(`event`, `data?`): `void`

Defined in: [transports/broadcast-transport.ts:75](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L75)

Send event (not RPC)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `data?` | `unknown` |

#### Returns

`void`

***

### sendMessage()

> `protected` **sendMessage**(`_type`, `_data`): `void`

Defined in: [transports/broadcast-transport.ts:133](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L133)

Send a message through the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_type` | `string` |
| `_data` | `unknown` |

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`sendMessage`](Transport.md#sendmessage)

***

### subscribe()

> `protected` **subscribe**(`event`, `handler`): () => `void`

Defined in: [transports/broadcast-transport.ts:138](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L138)

Subscribe to messages from the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `handler` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`subscribe`](Transport.md#subscribe)

***

### unsubscribe()

> `protected` **unsubscribe**(`event`, `handler`): `void`

Defined in: [transports/broadcast-transport.ts:156](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/broadcast-transport.ts#L156)

Unsubscribe from transport messages

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `handler` | (`data`) => `void` |

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`unsubscribe`](Transport.md#unsubscribe)
