import { createViteConfig } from '../../packages/core/vite/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'NetworkClient',
  entry: 'src/client.ts',
  dir: __dirname,
  useVue: true,
  formats: ['es'],
  fileName: () => 'client.js',
  cssCodeSplit: false,
  dtsOptions: {
    insertTypesEntry: false,
  },
});

export default mergeConfig(baseConfig, defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        banner: `
          if (typeof window !== 'undefined') {
            window.process = window.process || { env: {} };
          }
        `,
      },
    },
    chunkSizeWarningLimit: 10000,
    minify: false,
  },
}));
