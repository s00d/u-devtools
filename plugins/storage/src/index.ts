import { definePlugin } from '@u-devtools/kit/define-plugin';

const storagePlugin = () =>
  definePlugin({
    name: 'storage',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: null, // No server file
  });

export const plugin = storagePlugin;
export { storagePlugin };
