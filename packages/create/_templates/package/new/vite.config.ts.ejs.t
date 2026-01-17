---
to: <%= name %>/vite.config.ts
---
import { createViteConfig } from '../core/vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: '<%= packageName || `@u-devtools/${name}` %>',
  entry: 'src/index.ts',
  dir: __dirname,
  useVue: <%= useVue ? 'true' : 'false' %>,
});

