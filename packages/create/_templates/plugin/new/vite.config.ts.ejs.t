---
to: <%= projectName %>/vite.config.ts
---
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  clearScreen: false,
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      exclude: ['src/ui/**/*.vue'],
      tsconfigPath: './tsconfig.json'
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        client: 'src/client.ts',
        app: 'src/app.ts',
      },
      name: 'UDevToolsPlugin',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@u-devtools/core', '@u-devtools/ui', '@u-devtools/kit', 'node:path', 'node:url'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});

