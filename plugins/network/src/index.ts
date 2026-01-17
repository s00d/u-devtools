import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-network',
  version: '0.1.0',
  description: 'Network logger plugin for Universal DevTools',
};

const networkPlugin = () =>
  definePlugin({
    name: 'network',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: null, // No server file
    meta,
  });

export const plugin = networkPlugin;
export { networkPlugin };
