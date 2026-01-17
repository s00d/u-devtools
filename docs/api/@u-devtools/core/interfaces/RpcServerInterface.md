[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / RpcServerInterface

# Interface: RpcServerInterface

Defined in: [index.ts:559](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L559)

RPC Server Interface - Interface for handling RPC requests from clients.
Used in server-side plugin setup to register method handlers.

## Example

```ts
export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('my-plugin:getData', async (payload) => {
    // Handle RPC call
    return { data: 'result' };
  });

  rpc.broadcast('my-plugin:update', { data: 'new' });
}
```

## Methods

### broadcast()

> **broadcast**(`event`, `payload?`): `void`

Defined in: [index.ts:572](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L572)

Broadcast an event to all connected clients.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | Event name |
| `payload?` | `unknown` | Optional event data |

#### Returns

`void`

***

### handle()

> **handle**(`method`, `fn`): `void`

Defined in: [index.ts:565](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L565)

Register a handler for an RPC method.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `method` | `string` | Method name (e.g., 'my-plugin:getData') |
| `fn` | (`payload`) => `unknown` | Handler function that receives payload and returns result |

#### Returns

`void`
