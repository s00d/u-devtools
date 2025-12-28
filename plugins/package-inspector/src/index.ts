import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientPath = path.resolve(__dirname, './client.ts');

export const packageInspectorPlugin = (): DevToolsPlugin => ({
  name: 'Package Inspector',
  clientPath,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});

