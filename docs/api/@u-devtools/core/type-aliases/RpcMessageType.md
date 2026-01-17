[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / RpcMessageType

# Type Alias: RpcMessageType

> **RpcMessageType** = `object`

Defined in: [schemas/rpc.ts:23](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L23)

Type inferred from RpcMessageSchema

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="error"></a> `error?` | `unknown` | Error information (for error responses) | [schemas/rpc.ts:17](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L17) |
| <a id="id"></a> `id` | `string` | Unique message identifier | [schemas/rpc.ts:9](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L9) |
| <a id="method"></a> `method?` | `string` | RPC method name (for requests and events) | [schemas/rpc.ts:13](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L13) |
| <a id="payload"></a> `payload?` | `unknown` | Message payload data | [schemas/rpc.ts:15](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L15) |
| <a id="type"></a> `type` | `"request"` \| `"response"` \| `"event"` | Message type: 'request' for RPC calls, 'response' for replies, 'event' for broadcasts | [schemas/rpc.ts:11](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/schemas/rpc.ts#L11) |
