import { createViteConfig } from '../core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsBridge',
  entry: 'src/index.ts',
  dir: __dirname,
  clearScreen: false,
  useVue: false,
  dtsOptions: {
    insertTypesEntry: true,
  },
  resolveAlias: {
    '@u-devtools/core': '../core/src',
  },
  external: ['vite'],
});
