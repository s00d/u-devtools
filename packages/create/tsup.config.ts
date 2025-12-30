import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  clean: true,
  minify: true,
  outDir: 'dist',
  outExtension() {
    return {
      js: '.js',
    };
  },
  esbuildOptions(options) {
    options.outbase = '.';
  },
});

