import { definePlugin } from '@u-devtools/kit/define-plugin';

const libraryPlugin = () =>
  definePlugin({
    name: 'library',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
  });

export const plugin = libraryPlugin;
export { libraryPlugin };

