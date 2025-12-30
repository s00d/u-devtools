import { definePlugin } from '@u-devtools/kit';

export const storagePlugin = () =>
  definePlugin({
    name: 'Storage',
    root: import.meta.url,
    client: './client',
    app: './app',
  });
