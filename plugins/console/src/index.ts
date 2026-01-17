import { definePlugin } from '@u-devtools/kit/define-plugin';

const consolePlugin = () =>
  definePlugin({
    name: 'console',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: null, // No server file
  });

export const plugin = consolePlugin;
export { consolePlugin };
