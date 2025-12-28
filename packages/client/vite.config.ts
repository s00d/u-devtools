import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  clearScreen: false,
  plugins: [vue(), UnoCSS()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'DevToolsClient',
      fileName: 'main',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'virtual:u-devtools-plugins'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
