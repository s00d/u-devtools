import { createViteConfig } from '../core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsVite',
  entry: 'src/index.ts',
  dir: __dirname,
  clearScreen: false,
  useVue: false,
  formats: ['es'],
  fileName: 'index',
  dtsOptions: {
    insertTypesEntry: true,
  },
  resolveAlias: {
    '@u-devtools/core': '../core/src',
    '@u-devtools/bridge': '../bridge/src',
  },
  external: [
    'launch-editor',
    'node:fs',
    'node:https',
    'node:child_process',
    'node:util',
  ],
});

