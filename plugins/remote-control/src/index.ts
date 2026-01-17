import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-remote-control',
  version: '0.0.0',
  description: 'Remote Control plugin - DOM Mirroring with rrweb',
};

const remoteControlPlugin = () =>
  definePlugin({
    name: 'remote-control',
    root: import.meta.url,
    client: './client',
    server: './server',
    app: './app',
    meta,
  });

export const plugin = remoteControlPlugin;
export { remoteControlPlugin };
