---
to: <%= projectName %>/vite.config.standalone.ts
---
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [react()],
  build: {
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/client.tsx'),
      name: 'UDevToolsPluginClient',
      fileName: () => 'client.js',
      formats: ['es'],
    },
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
  resolve: {
    alias: {
      '@u-devtools/core': resolve(__dirname, '../../packages/core/src'),
      '@u-devtools/ui': resolve(__dirname, '../../packages/ui/src'),
      '@u-devtools/utils': resolve(__dirname, '../../packages/utils/src'),
      '@u-devtools/kit': resolve(__dirname, '../../packages/kit/src'),
      '@u-devtools/overlay': resolve(__dirname, '../../packages/overlay/src'),
      '@u-devtools/bridge': resolve(__dirname, '../../packages/bridge/src'),
    },
  },
});
