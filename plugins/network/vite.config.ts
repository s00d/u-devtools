import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { cleanTimestampFiles } from '../../shared/clean-timestamp-plugin';

export default defineConfig({
  clearScreen: false,
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      exclude: ['src/ui/**/*.vue'],
      tsconfigPath: './tsconfig.json',
    }),
    cleanTimestampFiles(__dirname),
  ],
  resolve: {
    alias: {
      '@u-devtools/core': path.resolve(__dirname, '../../packages/core/src'),
      '@u-devtools/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        client: 'src/client.ts',
        app: 'src/app.ts',
      },
      name: 'UDevToolsNetwork',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@u-devtools/core', '@u-devtools/ui', 'node:path', 'node:url'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});

