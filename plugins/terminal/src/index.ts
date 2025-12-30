import { definePlugin } from '@u-devtools/kit';
import { setupServer } from './server.js';

// Метаданные определяем статически (из package.json во время сборки)
const meta = {
  name: '@u-devtools/plugin-terminal',
  version: '0.1.0',
  description: 'Terminal plugin for running npm scripts from DevTools',
};

export const terminalPlugin = () =>
  definePlugin({
    name: 'Terminal',
    root: import.meta.url,
    client: './client',
    meta,
    setupServer: (rpc, ctx) => setupServer(rpc, ctx),
  });
