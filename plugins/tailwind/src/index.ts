import { definePlugin } from '@u-devtools/kit/define-plugin';
import { udtLocatorPlugin } from './node/vite-plugin';

const tailwindPlugin = () =>
  definePlugin({
    name: 'Tailwind',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
    vitePlugins: [
      () => udtLocatorPlugin(),
    ],
  });

export const plugin = tailwindPlugin;
export { tailwindPlugin };
