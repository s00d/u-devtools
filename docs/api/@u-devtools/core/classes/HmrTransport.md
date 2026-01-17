[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / HmrTransport

# Class: HmrTransport

Defined in: [transports/hmr-transport.ts:7](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L7)

Transport based on Vite HMR (Hot Module Replacement)
Used for communication between client (iframe) and server (Node.js)

## Extends

- [`Transport`](Transport.md)

## Constructors

### Constructor

> **new HmrTransport**(`hot`): `HmrTransport`

Defined in: [transports/hmr-transport.ts:11](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L11)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hot` | \{ `off?`: (`event`, `handler`) => `void`; `on`: (`event`, `handler`) => `void`; `send`: (`event`, `data`) => `void`; \} |
| `hot.off?` | (`event`, `handler`) => `void` |
| `hot.on` | (`event`, `handler`) => `void` |
| `hot.send` | (`event`, `data`) => `void` |

#### Returns

`HmrTransport`

#### Overrides

[`Transport`](Transport.md).[`constructor`](Transport.md#constructor)

## Properties

### disposed

> `protected` **disposed**: `boolean` = `false`

Defined in: [transport.ts:20](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L20)

#### Inherited from

[`BroadcastTransport`](BroadcastTransport.md).[`disposed`](BroadcastTransport.md#disposed)

***

### eventListeners

> `protected` **eventListeners**: `Map`\<`string`, `Set`\<(`data`) => `void`\>\>

Defined in: [transport.ts:19](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L19)

#### Inherited from

[`Transport`](Transport.md).[`eventListeners`](Transport.md#eventlisteners)

***

### handlers

> `protected` **handlers**: `Map`\<`string`, \{ `reject`: (`error`) => `void`; `resolve`: (`value`) => `void`; \}\>

Defined in: [transport.ts:15](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L15)

#### Inherited from

[`Transport`](Transport.md).[`handlers`](Transport.md#handlers)

***

### timeout

> `protected` **timeout**: `number` = `5000`

Defined in: [transport.ts:21](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L21)

#### Inherited from

[`BroadcastTransport`](BroadcastTransport.md).[`timeout`](BroadcastTransport.md#timeout)

## Methods

### call()

> **call**\<`T`\>(`method`, `payload?`): `Promise`\<`T`\>

Defined in: [transport.ts:41](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L41)

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

Defined in: [transports/hmr-transport.ts:71](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L71)

Clean up all handlers and subscriptions

#### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`dispose`](Transport.md#dispose)

***

### handleMessage()

> `protected` **handleMessage**(`data`): `void`

Defined in: [transport.ts:115](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L115)

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

Defined in: [transport.ts:105](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transport.ts#L105)

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

Defined in: [transports/hmr-transport.ts:37](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L37)

Override on() for HMR, as subscription is already set up in constructor

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `fn` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

#### Overrides

[`Transport`](Transport.md).[`on`](Transport.md#on)

***

### sendMessage()

> `protected` **sendMessage**(`type`, `data`): `void`

Defined in: [transports/hmr-transport.ts:52](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L52)

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

Defined in: [transports/hmr-transport.ts:58](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L58)

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

Defined in: [transports/hmr-transport.ts:66](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/transports/hmr-transport.ts#L66)

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
