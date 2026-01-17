import { definePlugin } from '@u-devtools/kit/define-plugin';

const securityPlugin = () =>
  definePlugin({
    name: 'security',
    root: import.meta.url,
    app: './app',
    server: './server',
  });

export const plugin = securityPlugin;
export { securityPlugin };
