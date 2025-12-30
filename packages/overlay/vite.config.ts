import { createViteConfig } from '../core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'UDTOverlay',
  entry: 'src/main.ts',
  dir: __dirname,
  useVue: true,
  formats: ['es'],
  fileName: 'index',
  cssCodeSplit: false, // Не разделять CSS
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.vue'],
  },
  additionalPlugins: [
    tailwindcss(),
  ],
  resolveAlias: {
    '@': './src',
  },
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    // Явно указываем Vite инлайнить ассеты меньше 100мб (т.е. все) в base64 или строки,
    // хотя для ?inline импортов это не критично, но может помочь
    build: {
      assetsInlineLimit: 100000000,
    },
  })
);
