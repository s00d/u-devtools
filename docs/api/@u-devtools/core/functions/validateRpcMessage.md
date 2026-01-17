[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / validateRpcMessage

# Function: validateRpcMessage()

> **validateRpcMessage**(`data`): \{ `error?`: `unknown`; `id`: `string`; `method?`: `string`; `payload?`: `unknown`; `type`: `"request"` \| `"response"` \| `"event"`; \} \| `null`

Defined in: [schemas/rpc.ts:30](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L30)

Validates an unknown value as an RPC message.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `unknown` | Data to validate |

## Returns

\{ `error?`: `unknown`; `id`: `string`; `method?`: `string`; `payload?`: `unknown`; `type`: `"request"` \| `"response"` \| `"event"`; \}

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `error?` | `unknown` | Error information (for error responses) | [schemas/rpc.ts:17](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L17) |
| `id` | `string` | Unique message identifier | [schemas/rpc.ts:9](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L9) |
| `method?` | `string` | RPC method name (for requests and events) | [schemas/rpc.ts:13](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L13) |
| `payload?` | `unknown` | Message payload data | [schemas/rpc.ts:15](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L15) |
| `type` | `"request"` \| `"response"` \| `"event"` | Message type: 'request' for RPC calls, 'response' for replies, 'event' for broadcasts | [schemas/rpc.ts:11](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L11) |

`null`

Validated RPC message or null if validation fails
