import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UDevToolsKit',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: (id: string) => {
        // Externalize vite, vue, and @u-devtools packages
        if (id === 'vite' || id === 'vue' || id.startsWith('@u-devtools/')) return true;
        // Externalize all node: modules
        if (id.startsWith('node:')) return true;
        return false;
      },
    },
  },
});

