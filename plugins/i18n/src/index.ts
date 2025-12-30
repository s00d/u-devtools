import { definePlugin } from '@u-devtools/kit';
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { setupServer } from './server.js';

// Метаданные определяем статически (из package.json во время сборки)
const meta = {
  name: '@u-devtools/plugin-i18n',
  version: '0.1.0',
  description: 'i18n plugin for Universal DevTools',
};

export interface I18nPluginOptions {
  dir: string;
  defaultLocale?: string;
}

export const i18nPlugin = (options: I18nPluginOptions) =>
  definePlugin({
    name: 'i18n',
    root: import.meta.url,
    client: './client',
    meta,
    setupServer: (rpc: RpcServerInterface, ctx: ServerContext) => setupServer(rpc, ctx, options),
  });
