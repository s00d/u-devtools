import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

export default defineConfig({
  clearScreen: false,
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    alias: {
      '@u-devtools/core': path.resolve(__dirname, '../core/src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'UDevToolsBridge',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vite'],
      output: {
        globals: {},
      },
    },
  },
});

