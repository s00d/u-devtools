import { definePlugin } from '@u-devtools/kit';

// Метаданные определяем статически (из package.json во время сборки)
const meta = {
  name: '@u-devtools/plugin-network',
  version: '0.1.0',
  description: 'Network logger plugin for Universal DevTools',
};

export const networkPlugin = () =>
  definePlugin({
    name: 'Network',
    root: import.meta.url,
    client: './client',
    app: './app',
    meta,
  });
