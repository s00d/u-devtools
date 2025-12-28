import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import { cleanTimestampFiles } from '../../shared/clean-timestamp-plugin';

export default defineConfig({
  clearScreen: false,
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
    cleanTimestampFiles(__dirname),
  ],
  resolve: {
    alias: {
      '@u-devtools/core': path.resolve(__dirname, '../core/src'),
      '@u-devtools/bridge': path.resolve(__dirname, '../bridge/src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'UDevToolsVite',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vite', '@u-devtools/bridge', '@u-devtools/core', 'launch-editor', 'node:path', 'node:url', 'node:module', 'node:fs', 'node:https'],
      output: {
        globals: {},
      },
    },
  },
});

