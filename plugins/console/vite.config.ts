import { createViteConfig } from '../../shared/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsConsole',
  entry: {
    client: 'src/client.ts',
    app: 'src/app.ts',
  },
  dir: __dirname,
  clearScreen: false,
  useVue: true,
  formats: ['es'],
  fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/ui/**/*.vue'],
    skipDiagnostics: true,
  },
  resolveAlias: {
    '@u-devtools/core': '../../packages/core/src',
    '@u-devtools/ui': '../../packages/ui/src',
  },
});

