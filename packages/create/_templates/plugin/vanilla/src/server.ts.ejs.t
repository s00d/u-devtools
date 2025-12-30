---
to: <%= projectName %>/src/server.ts
---
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('<%= pluginKebab %>:hello', () => 'Hello from Node.js to Vanilla JS!');
}

