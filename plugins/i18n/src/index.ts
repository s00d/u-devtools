import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientPath = path.resolve(__dirname, './client.ts');

export interface I18nPluginOptions {
  dir: string;
}

export const i18nPlugin = (options: I18nPluginOptions): DevToolsPlugin => ({
  name: 'i18n',
  clientPath,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx, options),
});
