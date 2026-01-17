import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-terminal',
  version: '0.1.0',
  description: 'Terminal plugin for running npm scripts from DevTools',
};

const terminalPlugin = () =>
  definePlugin({
    name: 'terminal',
    root: import.meta.url,
    client: './client',
    meta,
    server: './server',
  });

export const plugin = terminalPlugin;
export { terminalPlugin };
