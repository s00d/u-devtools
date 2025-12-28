import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  clearScreen: false,
  plugins: [vue(), tailwindcss()],
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
