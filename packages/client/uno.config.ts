import { defineConfig, presetUno, presetIcons } from 'unocss';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  content: {
    pipeline: {
      include: ['src/**/*.{vue,ts}', resolve(__dirname, '../../packages/ui/src/**/*.{vue,ts}')],
    },
  },
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'icon-btn': 'op50 hover:op100 transition cursor-pointer',
  },
});
