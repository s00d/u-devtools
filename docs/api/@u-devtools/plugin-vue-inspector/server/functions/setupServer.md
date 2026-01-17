[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/plugin-vue-inspector](../../README.md) / [server](../README.md) / setupServer

# Function: setupServer()

> **setupServer**(`rpc`, `ctx`): `void`

Defined in: [server.ts:16](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/plugins/vue-inspector/src/server.ts#L16)

Server-side RPC handlers for Vue Inspector plugin

Note: Component/Pinia/Router data is accessed directly from app.ts via AppBridge
in the client. Server.ts only handles server-side operations if needed.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `rpc` | [`RpcServerInterface`](../../../core/interfaces/RpcServerInterface.md) |
| `ctx` | [`ServerContext`](../../../core/interfaces/ServerContext.md) |

## Returns

`void`
