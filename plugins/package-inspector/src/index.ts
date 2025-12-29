import { definePlugin } from '@u-devtools/kit';
import { setupServer } from './server.js';

export const packageInspectorPlugin = () => definePlugin({
  name: 'Package Inspector',
  root: import.meta.url,
  client: './client',
  setupServer: (rpc, ctx) => setupServer(rpc, ctx),
});

