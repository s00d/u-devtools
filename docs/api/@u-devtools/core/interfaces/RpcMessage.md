[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / RpcMessage

# Interface: RpcMessage\<T\>

Defined in: [index.ts:12](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L12)

RPC message structure for communication between Server and Client contexts.
Used for typed RPC over WebSocket (Server ↔ Client).

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `unknown` | Type of the payload data |

## Properties

### error?

> `optional` **error**: `unknown`

Defined in: [index.ts:22](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L22)

Error information (for error responses)

***

### id

> **id**: `string`

Defined in: [index.ts:14](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L14)

Unique message identifier

***

### method?

> `optional` **method**: `string`

Defined in: [index.ts:18](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L18)

RPC method name (for requests)

***

### payload?

> `optional` **payload**: `T`

Defined in: [index.ts:20](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L20)

Message payload data

***

### type

> **type**: `"request"` \| `"response"` \| `"event"`

Defined in: [index.ts:16](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L16)

Message type: 'request' for RPC calls, 'response' for replies, 'event' for broadcasts
