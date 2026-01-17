---
to: <%= projectName %>/vite.config.ts
---
import { createViteConfig } from '@u-devtools/core/vite/vite.config.base';
import solid from 'vite-plugin-solid';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsPlugin',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.tsx',
<% if (features.includes('app-bridge')) { -%>
    app: 'src/app.ts',
<% } -%>
    server: 'src/server.ts',
  },
  dir: __dirname,
  clearScreen: false,
  useVue: false,
  additionalPlugins: [solid()],
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.tsx'],
  },
  external: ['node:path', 'node:url'],
});

