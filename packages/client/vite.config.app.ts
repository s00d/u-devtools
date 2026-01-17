import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Важно: относительные пути, чтобы работало в Electron (app:// или file://)
  base: './',
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      // Алиасы должны совпадать с основным конфигом
      '@u-devtools/core': path.resolve(__dirname, '../core/src'),
      '@u-devtools/ui': path.resolve(__dirname, '../ui/src'),
      '@u-devtools/utils': path.resolve(__dirname, '../utils/src'),
      '@u-devtools/bridge': path.resolve(__dirname, '../bridge/src'),
      // Мок для виртуального модуля плагинов (в standalone режиме плагины грузятся иначе)
      'virtual:u-devtools-plugins': path.resolve(__dirname, 'src/mocks/plugins.ts')
    }
  },
  optimizeDeps: {
  },
  build: {
    // Собираем в отдельную папку, чтобы не мешать lib-сборке
    outDir: 'dist-app',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});
