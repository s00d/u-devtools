import { createViteConfig } from '../../shared/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsUtils',
  entry: 'src/index.ts',
  dir: __dirname,
  useVue: false,
});
