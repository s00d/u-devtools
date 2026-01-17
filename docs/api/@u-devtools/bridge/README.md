[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/bridge

# @u-devtools/bridge

[![npm version](https://img.shields.io/npm/v/@u-devtools/bridge/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/bridge)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/bridge?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/bridge)
[![License](https://img.shields.io/npm/l/@u-devtools/bridge?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/bridge)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

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

## Classes

- [ViteRpcClient](classes/ViteRpcClient.md)
- [ViteRpcServer](classes/ViteRpcServer.md)
