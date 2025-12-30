import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'UDTOverlay',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => {
        if (id === 'vue') return true;
        return false;
      },
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    cssCodeSplit: false,
  },
});

