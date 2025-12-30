import { definePlugin } from '@u-devtools/kit';

export const consolePlugin = () =>
  definePlugin({
    name: 'Console',
    root: import.meta.url,
    client: './client',
    app: './app',
  });

