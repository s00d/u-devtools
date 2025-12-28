import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const networkPlugin = (): DevToolsPlugin => ({
  name: 'Network',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'),
});
