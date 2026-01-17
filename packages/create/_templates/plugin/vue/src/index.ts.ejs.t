---
to: <%= projectName %>/src/index.ts
---
import { definePlugin } from '@u-devtools/kit/define-plugin';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
  
  const pluginFunctionName = pluginName
    .replace(/\s+/g, '')
    .replace(/^./, (c) => c.toLowerCase())
    .replace(/\s*([A-Z])/g, (_, c) => c) + 'Plugin';
-%>

// Metadata defined statically (from package.json during build)
const meta = {
  name: '<%= packageName %>',
  version: '0.0.0',
  description: '<%= description %>',
};

const <%= pluginFunctionName %> = () =>
  definePlugin({
    name: '<%= pluginKebab %>',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
    meta,
  });

export const plugin = <%= pluginFunctionName %>;
export { <%= pluginFunctionName %> };
