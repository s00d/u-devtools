import { createViteConfig } from '../../shared/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsTerminal',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    server: 'src/server.ts',
  },
  dir: __dirname,
  clearScreen: false,
  useVue: true,
  formats: ['es'],
  fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/ui/**/*.vue'],
  },
  resolveAlias: {
    '@u-devtools/core': '../../packages/core/src',
    '@u-devtools/ui': '../../packages/ui/src',
  },
  external: ['@u-devtools/kit', 'node:child_process', 'node:fs/promises'],
});

