import type { DevToolsPlugin } from '@u-devtools/core';
import { setupServer } from './server.js';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ИСПРАВЛЕНИЕ: Выходим из dist (..) и идем в src
const clientPath = path.resolve(__dirname, '../src/client.ts');

// Метаданные определяем статически (из package.json во время сборки)
const meta: DevToolsPlugin['meta'] = {
  name: '@u-devtools/plugin-i18n',
  version: '0.1.0',
  description: 'i18n plugin for Universal DevTools',
};

export interface I18nPluginOptions {
  dir: string;
  defaultLocale?: string;
}

export const i18nPlugin = (options: I18nPluginOptions): DevToolsPlugin => ({
  name: 'i18n',
  clientPath,
  meta,
  setupServer: (rpc, ctx) => setupServer(rpc, ctx, options),
});
