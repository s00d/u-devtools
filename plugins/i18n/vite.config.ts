import { createViteConfig } from '../../packages/core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsI18n',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    server: 'src/server.ts',
  },
  dir: __dirname,
  clearScreen: false,
  useVue: true,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/ui/**/*.vue'],
  },
  external: ['@u-devtools/kit', 'json-to-ast', 'node:fs/promises'],
});
