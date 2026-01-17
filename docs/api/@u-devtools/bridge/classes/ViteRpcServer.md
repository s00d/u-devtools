[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/bridge](../README.md) / ViteRpcServer

# Class: ViteRpcServer

Defined in: [index.ts:127](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L127)

Server-side RPC implementation (Node.js)
Works through server.ws

## Constructors

### Constructor

> **new ViteRpcServer**(`ws`): `ViteRpcServer`

Defined in: [index.ts:130](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L130)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ws` | \{ `on`: (`event`, `handler`) => `void`; `send`: (`event`, `data`) => `void`; \} |
| `ws.on` | (`event`, `handler`) => `void` |
| `ws.send` | (`event`, `data`) => `void` |

#### Returns

`ViteRpcServer`

## Methods

### broadcast()

> **broadcast**(`event`, `payload?`): `void`

Defined in: [index.ts:198](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L198)

Broadcast an event to all connected clients

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `payload?` | `unknown` | Optional event payload |

#### Returns

`void`

***

### getMethods()

> **getMethods**(): `string`[]

Defined in: [index.ts:219](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L219)

Get list of all registered method names

#### Returns

`string`[]

Array of method names

***

### getMethodsCount()

> **getMethodsCount**(): `number`

Defined in: [index.ts:211](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L211)

Get the number of registered methods

#### Returns

`number`

Number of registered methods

***

### handle()

> **handle**(`method`, `fn`): `void`

Defined in: [index.ts:189](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/bridge/src/index.ts#L189)

Register a method handler

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `method` | `string` | Method name to handle |
| `fn` | (`payload`) => `unknown` | Handler function |

#### Returns

`void`
