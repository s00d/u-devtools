import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { cleanTimestampFiles } from './clean-timestamp-plugin';

interface ConfigOptions {
  entry: string;
  name: string;
  dir: string;
  external?: string[];
  clearScreen?: boolean;
}

export function createViteConfig({ entry, name, dir, external = [], clearScreen = false }: ConfigOptions) {
  return defineConfig({
    clearScreen,
    plugins: [
      vue(),
      dts({
        rollupTypes: true,
        tsconfigPath: resolve(dir, 'tsconfig.json'),
      }),
      cleanTimestampFiles(dir),
    ],
    build: {
      lib: {
        entry: resolve(dir, entry),
        name,
        fileName: (format: string) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: (id: string) => {
          // Always externalize vue, vite, and @u-devtools/core
          if (id === 'vue' || id === 'vite' || id === '@u-devtools/core') return true;
          // Externalize all node: modules
          if (id.startsWith('node:')) return true;
          // Externalize custom externals
          if (external.includes(id)) return true;
          return false;
        },
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  });
}
