import { createViteConfig } from '../core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'UDTOverlay',
  entry: {
    index: 'src/index.ts',
    main: 'src/main.ts',
  },
  dir: __dirname,
  useVue: true,
  formats: ['es'],
  fileName: (format, entryName) => {
    if (entryName === 'index') {
      return `index.${format === 'es' ? 'es' : 'cjs'}.js`;
    }
    return `main.${format === 'es' ? 'es' : 'cjs'}.js`;
  },
  cssCodeSplit: false, // Не разделять CSS - все стили в одном файле
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.vue', 'src/main.ts'],
  },
  resolveAlias: {
    '@': './src',
  },
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      tailwindcss({
        // Tailwind будет сканировать все файлы через @source в style.css
      }),
      // Plugin to handle virtual:u-devtools-app in production build
      {
        name: 'virtual-app-stub',
        resolveId(id) {
          if (id === 'virtual:u-devtools-app') {
            return '\0virtual:u-devtools-app';
          }
          return null;
        },
        load(id) {
          if (id === '\0virtual:u-devtools-app') {
            // In production build, return empty array (plugins will be injected at runtime)
            return 'export const appPlugins = [];';
          }
          return null;
        },
      },
    ],
    // Явно указываем Vite инлайнить ассеты меньше 100мб (т.е. все) в base64 или строки,
    // хотя для ?inline импортов это не критично, но может помочь
    build: {
      assetsInlineLimit: 100000000,
    },
  })
);
