import { definePlugin } from '@u-devtools/kit/define-plugin';

const seoPlugin = () =>
  definePlugin({
    name: 'seo',
    root: import.meta.url,
    app: './app',
    server: './server',
  });

export const plugin = seoPlugin;
export { seoPlugin };
