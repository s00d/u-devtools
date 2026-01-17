import { definePlugin } from '@u-devtools/kit/define-plugin';

// Metadata defined statically (from package.json during build)
const meta = {
  name: '@u-devtools/plugin-repo2txt',
  version: '0.0.0',
  description: 'repo2txt plugin',
};

const repo2txtPlugin = () =>
  definePlugin({
    name: 'repo2txt',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
    meta,
  });

export const plugin = repo2txtPlugin;
export { repo2txtPlugin };
