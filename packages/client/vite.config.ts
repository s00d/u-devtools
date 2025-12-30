import { createViteConfig } from '../../shared/vite.config.base';
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
  formats: ['es'],
  fileName: 'main',
  dtsOptions: {
    insertTypesEntry: true,
    exclude: ['src/**/*.vue'],
    skipDiagnostics: true,
  },
  additionalPlugins: [tailwindcss()],
  external: ['virtual:u-devtools-plugins'],
});

export default mergeConfig(baseConfig, defineConfig({
  build: {
    rollupOptions: {
      external: (id: string) => {
        // ВАЖНО: В external НЕ должно быть '@u-devtools/ui'
        // Мы хотим, чтобы код UI и его CSS (Tailwind) вшились внутрь клиента
        if (id === 'vue' || id === 'virtual:u-devtools-plugins') return true;
        return false;
      },
    },
  },
}));
