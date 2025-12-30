import { definePlugin } from '@u-devtools/kit';

export const inspectorPlugin = () =>
  definePlugin({
    name: 'Inspector',
    root: import.meta.url,
    client: './client',
    app: './app',
  });
