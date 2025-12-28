import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const inspectorPlugin = (): DevToolsPlugin => ({
  name: 'Inspector',
  clientPath: path.resolve(__dirname, '../src/client.ts'),
  appPath: path.resolve(__dirname, '../src/app.ts'),
});
