---
to: <%= projectName %>/src/server.ts
---
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
<% if (features.includes('filesystem')) { -%>
import fs from 'node:fs/promises';
import path from 'node:path';
<% } -%>

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // Example: Simple RPC method
  rpc.handle('<%= pluginKebab %>:hello', () => {
    return 'Hello from Server!';
  });

  // Example: RPC method with parameters
  rpc.handle('<%= pluginKebab %>:echo', (payload: unknown) => {
    const message = payload as string;
    return `Echo: ${message}`;
  });

<% if (features.includes('filesystem')) { -%>
  // Example: File system operation
  rpc.handle('<%= pluginKebab %>:read-file', async (payload: unknown) => {
    const filePath = payload as string;
    try {
      const fullPath = path.resolve(ctx.root, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
<% } -%>

  // Example: Broadcast event
  rpc.handle('<%= pluginKebab %>:broadcast', (data: unknown) => {
    rpc.broadcast('<%= pluginKebab %>:event', data);
    return { success: true };
  });
}
