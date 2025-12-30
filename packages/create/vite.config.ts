import { createViteConfig } from '../../shared/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'CreateUDevTools',
  entry: 'src/index.ts',
  dir: __dirname,
  useVue: false,
  formats: ['es'],
  fileName: 'index',
  dtsOptions: {
    insertTypesEntry: true,
  },
  external: [
    'hygen',
    'hygen/dist/logger.js',
    'enquirer',
    'execa',
  ],
});

export default mergeConfig(baseConfig, defineConfig({
  build: {
    rollupOptions: {
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
    minify: true,
  },
}));

