import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-i18n',
  version: '0.1.0',
  description: 'i18n plugin for Universal DevTools',
};

export interface I18nPluginOptions {
  dir: string;
  defaultLocale?: string;
}

// Store options globally for server.ts to access
let pluginOptions: I18nPluginOptions | null = null;

export function getI18nOptions(): I18nPluginOptions | null {
  return pluginOptions;
}

const i18nPlugin = (options: I18nPluginOptions) => {
  pluginOptions = options;
  return definePlugin({
    name: 'i18n',
    root: import.meta.url,
    client: './client',
    meta,
    server: './server',
  });
};

export const plugin = i18nPlugin;
export { i18nPlugin };
