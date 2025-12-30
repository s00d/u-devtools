# @u-devtools/bridge

RPC bridge for Universal DevTools communication. Handles typed RPC calls between Server and Client contexts via Vite HMR WebSocket.

## Installation

```bash
npm install -D @u-devtools/bridge
```

## Usage

```ts
import { ViteRpcClient, ViteRpcServer } from '@u-devtools/bridge';

// Client side
const rpc = new ViteRpcClient(import.meta.hot);
await rpc.call('method:name', payload);

// Server side
const rpc = new ViteRpcServer(server.ws);
rpc.handle('method:name', async (payload) => { /* ... */ });
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/packages/bridge)

