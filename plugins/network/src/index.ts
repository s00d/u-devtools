import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Метаданные определяем статически (из package.json во время сборки)
const meta: DevToolsPlugin['meta'] = {
  name: '@u-devtools/plugin-network',
  version: '0.1.0',
  description: 'Network logger plugin for Universal DevTools',
};

export const networkPlugin = (): DevToolsPlugin => ({
  name: 'Network',
  clientPath: path.resolve(__dirname, '../src/client.ts'),
  appPath: path.resolve(__dirname, '../src/app.ts'),
  meta,
});
