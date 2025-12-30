---
to: <%= projectName %>/vite.config.ts
---
import { createViteConfig } from '@u-devtools/core/vite/vite.config.base';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsPlugin',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
<% if (features.includes('app-bridge')) { -%>
    app: 'src/app.ts',
<% } -%>
    server: 'src/server.ts',
  },
  dir: __dirname,
  useVue: false,
  dtsOptions: {
    insertTypesEntry: true,
  },
  resolveAlias: {
    '@u-devtools/core': '../../packages/core/src',
    '@u-devtools/kit': '../../packages/kit/src',
  },
  external: ['node:path', 'node:url'],
});

