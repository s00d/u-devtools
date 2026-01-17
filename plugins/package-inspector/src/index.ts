import { definePlugin } from '@u-devtools/kit/define-plugin';

const packageInspectorPlugin = () =>
  definePlugin({
    name: 'package-inspector',
    root: import.meta.url,
    client: './client',
    server: './server',
  });

export const plugin = packageInspectorPlugin;
export { packageInspectorPlugin };
