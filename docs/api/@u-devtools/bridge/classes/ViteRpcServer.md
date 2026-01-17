[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/bridge](../README.md) / ViteRpcServer

# Class: ViteRpcServer

Defined in: [index.ts:123](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L123)

Server-side RPC implementation (Node.js)
Works through server.ws

## Constructors

### Constructor

> **new ViteRpcServer**(`ws`): `ViteRpcServer`

Defined in: [index.ts:126](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L126)

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

Defined in: [index.ts:194](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L194)

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

Defined in: [index.ts:214](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L214)

Get list of all registered method names

#### Returns

`string`[]

Array of method names

***

### getMethodsCount()

> **getMethodsCount**(): `number`

Defined in: [index.ts:206](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L206)

Get the number of registered methods

#### Returns

`number`

Number of registered methods

***

### handle()

> **handle**(`method`, `fn`): `void`

Defined in: [index.ts:185](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/bridge/src/index.ts#L185)

Register a method handler

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `method` | `string` | Method name to handle |
| `fn` | (`payload`) => `unknown` | Handler function |

#### Returns

`void`
