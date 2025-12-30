import { createViteConfig } from './vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createViteConfig({
  name: 'UDevToolsCore',
  entry: 'src/index.ts',
  dir: __dirname,
  clearScreen: false,
  // node:path is used in utils/path.ts (safeResolve)
  // It's only used in server-side code, but we need to externalize it for browser builds
  external: ['node:path'],
});
