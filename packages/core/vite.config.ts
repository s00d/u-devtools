import { createViteConfig } from './vite/vite.config.base';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to generate and copy vite.config.base.d.ts to dist/vite/
const copyDtsPlugin = (): Plugin => ({
  name: 'copy-vite-dts',
  async writeBundle() {
    const { execSync } = await import('node:child_process');
    const targetDir = join(__dirname, 'dist', 'vite');
    try {
      // Generate types using tsc
      execSync(
        `npx tsc vite/vite.config.base.ts --declaration --emitDeclarationOnly --outDir ${targetDir} --moduleResolution bundler --module esnext --target es2020 --esModuleInterop --skipLibCheck --resolveJsonModule`,
        { cwd: __dirname, stdio: 'ignore' }
      );
    } catch (error) {
      // Fallback: try to copy if file exists
      const source = join(__dirname, 'vite', 'vite.config.base.d.ts');
      if (existsSync(source)) {
        copyFileSync(source, join(targetDir, 'vite.config.base.d.ts'));
      }
    }
  },
});

export default createViteConfig({
  name: 'UDevToolsCore',
  entry: {
    index: 'src/index.ts',
    'vite/vite.config.base': 'vite/vite.config.base.ts',
  },
  dir: __dirname,
  clearScreen: false,
  // Externalize all dependencies used in vite.config.base.ts
  // These are build-time dependencies and should not be bundled
  external: [
    'vite',
    '@vitejs/plugin-vue',
    'vite-plugin-dts',
    'node:path',
    'node:fs',
    'path',
    'fs',
    'url',
    'os',
    'module',
    'assert',
    'util',
    'stream',
    'constants',
  ],
  dtsOptions: {
    rollupTypes: true,
    copyDtsFiles: false,
    exclude: ['vite/**'],
  },
  additionalPlugins: [copyDtsPlugin()],
  fileName: (format, entryName) => {
    // For vite/ files, preserve the directory structure
    if (entryName?.startsWith('vite/')) {
      const name = entryName.replace('vite/', '');
      return `vite/${name}.${format === 'es' ? 'js' : 'cjs.js'}`;
    }
    // For index, use default naming
    return `index.${format === 'es' ? 'es' : 'cjs'}.js`;
  },
});
