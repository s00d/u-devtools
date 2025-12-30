import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CreateUDevTools',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'hygen',
        'hygen/dist/logger.js',
        'enquirer',
        'execa',
        'node:path',
        'node:url',
        'node:module',
      ],
      output: {
        banner: '#!/usr/bin/env node',
        globals: {},
      },
    },
    minify: true,
    outDir: 'dist',
  },
});

