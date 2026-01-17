[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / WebSocketTransport

# Class: WebSocketTransport

Defined in: [transports/websocket-transport.ts:9](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L9)

Transport based on WebSocket
Used for communication between client and server when HMR is unavailable
(e.g., for remote debugging or production builds)

## Extends

- [`Transport`](Transport.md)

## Constructors

### Constructor

> **new WebSocketTransport**(`url`): `WebSocketTransport`

Defined in: [transports/websocket-transport.ts:22](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L22)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |

#### Returns

`WebSocketTransport`

#### Overrides

[`Transport`](Transport.md).[`constructor`](Transport.md#constructor)

## Properties

### disposed

> `protected` **disposed**: `boolean` = `false`

Defined in: [transport.ts:20](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transport.ts#L20)

#### Inherited from

[`BroadcastTransport`](BroadcastTransport.md).[`disposed`](BroadcastTransport.md#disposed)

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

[`BroadcastTransport`](BroadcastTransport.md).[`timeout`](BroadcastTransport.md#timeout)

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

#### Inherited from

[`Transport`](Transport.md).[`call`](Transport.md#call)

***

### dispose()

> **dispose**(): `void`

Defined in: [transports/websocket-transport.ts:134](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L134)

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

### isConnected()

> **isConnected**(): `boolean`

Defined in: [transports/websocket-transport.ts:155](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L155)

Check connection status

#### Returns

`boolean`

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

### sendMessage()

> `protected` **sendMessage**(`type`, `data`): `void`

Defined in: [transports/websocket-transport.ts:87](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L87)

Send a message through the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `string` |
| `data` | `unknown` |

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`sendMessage`](Transport.md#sendmessage)

***

### subscribe()

> `protected` **subscribe**(`_type`, `_handler`): () => `void`

Defined in: [transports/websocket-transport.ts:126](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L126)

Subscribe to messages from the transport

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_type` | `string` |
| `_handler` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`subscribe`](Transport.md#subscribe)

***

### unsubscribe()

> `protected` **unsubscribe**(`_type`, `_handler`): `void`

Defined in: [transports/websocket-transport.ts:130](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/transports/websocket-transport.ts#L130)

Unsubscribe from transport messages

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_type` | `string` |
| `_handler` | (`data`) => `void` |

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`unsubscribe`](Transport.md#unsubscribe)
