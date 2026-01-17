import { createViteConfig } from '../core/vite/vite.config.base';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Base config from createViteConfig
const baseConfig = createViteConfig({
  name: 'UDevToolsKit',
  entry: {
    index: 'src/index.ts',
    'web-components': 'src/web-components.ts',
    'define-plugin': 'src/define-plugin.ts',
    vue: 'src/vue.ts',
    react: 'src/react.ts',
    solid: 'src/solid.ts',
    svelte: 'src/svelte.ts',
    lit: 'src/lit.ts',
    vanilla: 'src/vanilla.ts',
  },
  dir: __dirname,
  useVue: true, // Vue needed for defineVueElement
  formats: ['es', 'cjs'],
  fileName: (format, entryName) => {
    if (entryName === 'index') {
      return `index.${format === 'es' ? 'es' : 'cjs'}.js`;
    }
    if (entryName === 'define-plugin') {
      return `define-plugin.${format === 'es' ? 'es' : 'cjs'}.js`;
    }
    return `${entryName}.${format === 'es' ? 'js' : 'cjs.js'}`;
  },
  dtsOptions: {
    insertTypesEntry: false,
    rollupTypes: false,
  },
  external: ['vue', 'react', 'react-dom', 'svelte', 'solid-js', 'lit'],
});

// Override external function to handle subpaths
export default mergeConfig(baseConfig, {
  build: {
    rollupOptions: {
      external: (id) => {
        // Node built-ins
        if (id.startsWith('node:')) return true;
        
        // Framework dependencies (exact matches)
        const frameworkDeps = ['vue', 'react', 'react-dom', 'svelte', 'solid-js', 'lit'];
        if (frameworkDeps.includes(id)) return true;
        
        // Framework subpaths (e.g., svelte/store, react/jsx-runtime, solid-js/web, lit/html)
        if (
          id.startsWith('svelte/') ||
          id.startsWith('react/') ||
          id.startsWith('react-dom/') ||
          id.startsWith('solid-js/') ||
          id.startsWith('lit/')
        ) {
          return true;
        }
        
        // @u-devtools packages
        if (id.startsWith('@u-devtools/')) return true;
        
        // Call base external function
        const baseExternal = baseConfig.build?.rollupOptions?.external;
        if (typeof baseExternal === 'function') {
          return baseExternal(id);
        }
        
        return false;
      },
    },
  },
});
