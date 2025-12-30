import { createViteConfig } from '../core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseConfig = createViteConfig({
  name: 'UDevToolsUI',
  entry: 'src/index.ts',
  dir: __dirname,
  clearScreen: false,
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [tailwindcss()],
  })
);
