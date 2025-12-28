import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ИСПРАВЛЕНИЕ: Выходим из dist (..) и идем в src
const clientPath = path.resolve(__dirname, '../src/client.ts');

// Метаданные определяем статически (из package.json во время сборки)
const meta: DevToolsPlugin['meta'] = {
  name: '@u-devtools/plugin-terminal',
  version: '0.1.0',
  description: 'Terminal plugin for running npm scripts from DevTools',
};

export const terminalPlugin = (): DevToolsPlugin => ({
  name: 'Terminal',
  clientPath,
  meta,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});

