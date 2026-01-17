import { createViteConfig } from '../../packages/core/vite/vite.config.base';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsTailwind',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    app: 'src/app.ts',
    server: 'src/server.ts',
  },
  dir: __dirname,
  useVue: true,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/ui/**/*.vue'],
  },
});
