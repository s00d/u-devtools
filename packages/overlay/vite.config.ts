import { createViteConfig } from '../core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
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
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.vue'],
  },
  additionalPlugins: [
    tailwindcss(),
    cssInjectedByJsPlugin({
      styleId: 'u-devtools-overlay-styles',
      topExecutionPriority: true,
    }),
  ],
  resolveAlias: {
    '@': './src',
  },
  cssCodeSplit: false,
});

export default mergeConfig(baseConfig, defineConfig({}));
