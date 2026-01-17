import { createViteConfig } from '../../packages/core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'UDevToolsRemoteControl',
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    app: 'src/app.ts',
  },
  dir: __dirname,
  clearScreen: false,
  useVue: true,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/ui/**/*.vue'],
  },
});

export default mergeConfig(baseConfig, defineConfig({
  optimizeDeps: {
  },
}));
