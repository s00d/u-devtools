import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ИСПРАВЛЕНИЕ: Выходим из dist (..) и идем в src
const clientPath = path.resolve(__dirname, '../src/client.ts');

export const terminalPlugin = (): DevToolsPlugin => ({
  name: 'Terminal',
  clientPath,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});

