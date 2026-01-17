import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-manager',
  version: '0.1.0',
  description: 'Plugin Manager for Universal DevTools',
};

const pluginManager = () =>
  definePlugin({
    name: 'manager',
    root: import.meta.url,
    client: './client',
    meta,
    server: './server',
  });

export const plugin = pluginManager;
export { pluginManager };
