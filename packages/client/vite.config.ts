import { createViteConfig } from '../core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'DevToolsClient',
  entry: 'src/main.ts',
  dir: __dirname,
  clearScreen: false,
  useVue: true,
  formats: ['es'], // Важно: ES модуль
  fileName: 'main',
  // Убираем cssCodeSplit, чтобы Vite не генерировал отдельные CSS файлы
  cssCodeSplit: false,
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.vue'],
  },
  additionalPlugins: [
    tailwindcss(),
  ],
  // ВАЖНО: 'virtual:u-devtools-plugins' должен быть внешним,
  // но CSS мы хотим ЗАИНЛАЙНИТЬ
  external: ['virtual:u-devtools-plugins'],
});

export default mergeConfig(baseConfig, defineConfig({}));
