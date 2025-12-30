import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('pkg:read', async () => {
    const pkgPath = path.resolve(ctx.root, 'package.json');
    try {
      const content = await fs.readFile(pkgPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read package.json: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}
