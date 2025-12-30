import { createViteConfig } from '../core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsUtilsNode',
  entry: 'src/index.ts',
  dir: __dirname,
  useVue: false,
});
