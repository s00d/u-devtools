import { definePlugin } from '@u-devtools/kit/define-plugin';

const inspectorPlugin = () =>
  definePlugin({
    name: 'Inspector', // Можно использовать с большой буквы - AppBridge автоматически нормализует к lowercase
    root: import.meta.url,
    client: './client',
    app: './app',
    server: null, // No server file
  });

export const plugin = inspectorPlugin;
export { inspectorPlugin };
