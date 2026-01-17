import { defineConfig, type Plugin, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { join, resolve } from 'node:path';
import { readdirSync, unlinkSync } from 'node:fs';

function cleanTimestampFiles(dir: string): Plugin {
  return {
    name: 'clean-timestamp-files',
    buildStart() {
      try {
        const files = readdirSync(dir);
        files.forEach((file) => {
          if (file.includes('.timestamp-') && file.endsWith('.mjs')) {
            try {
              unlinkSync(join(dir, file));
            } catch (_e) {
              // Ignore deletion errors
            }
          }
        });
      } catch (_e) {
        // Ignore directory read errors
      }
    },
  };
}

/**
 * Configuration options for createViteConfig
 * @internal
 */
export interface ConfigOptions {
  entry: string | Record<string, string>;
  name: string;
  dir: string;
  external?: string[];
  clearScreen?: boolean;
  useVue?: boolean;
  formats?: ('es' | 'cjs')[];
  fileName?: string | ((format: string, entryName?: string) => string);
  dtsOptions?: {
    insertTypesEntry?: boolean;
    exclude?: string[];
    rollupTypes?: boolean;
    copyDtsFiles?: boolean;
  };
  additionalPlugins?: PluginOption[];
  resolveAlias?: Record<string, string>;
  cssCodeSplit?: boolean;
}

/**
 * Creates a Vite configuration optimized for building DevTools packages.
 * 
 * This function generates a Vite config with proper TypeScript declaration file generation,
 * preserving JSDoc comments in .d.ts files for better IDE autocomplete.
 * 
 * @param options - Configuration options for the Vite build
 * @param options.entry - Entry point(s) for the library (string or record of entry points)
 * @param options.name - Library name (used for UMD builds)
 * @param options.dir - Package directory (usually __dirname)
 * @param options.external - Array of module IDs to externalize
 * @param options.clearScreen - Whether to clear screen on build (default: false)
 * @param options.useVue - Whether to include Vue plugin (default: true)
 * @param options.formats - Output formats: 'es' and/or 'cjs' (default: ['es', 'cjs'])
 * @param options.fileName - Custom file naming function or string
 * @param options.dtsOptions - Options for TypeScript declaration file generation
 * @param options.additionalPlugins - Additional Vite plugins to include
 * @param options.resolveAlias - Path aliases for module resolution
 * @param options.cssCodeSplit - Whether to enable CSS code splitting
 * @returns Vite configuration object
 * 
 * @example
 * ```ts
 * import { createViteConfig } from '@u-devtools/core/vite.config.base';
 * 
 * export default createViteConfig({
 *   name: 'MyPackage',
 *   entry: 'src/index.ts',
 *   dir: __dirname,
 * });
 * ```
 * 
 * @public
 */
export function createViteConfig({
  entry,
  name,
  dir,
  external = [],
  clearScreen = false,
  useVue = true,
  formats = ['es', 'cjs'],
  fileName,
  dtsOptions = {},
  additionalPlugins = [],
  resolveAlias,
  cssCodeSplit,
}: ConfigOptions) {
  const plugins: PluginOption[] = [];

  if (useVue) {
    plugins.push(vue());
  }

  plugins.push(
    dts({
      rollupTypes: dtsOptions.rollupTypes ?? !(dtsOptions.insertTypesEntry ?? false),
      insertTypesEntry: dtsOptions.insertTypesEntry ?? false,
      exclude: dtsOptions.exclude,
      copyDtsFiles: dtsOptions.copyDtsFiles,
      tsconfigPath: resolve(dir, 'tsconfig.json'),
      outDir: resolve(dir, 'dist'),
      compilerOptions: {
        removeComments: false, // Explicitly preserve JSDoc comments
      },
    })
  );

  plugins.push(cleanTimestampFiles(dir));
  plugins.push(...additionalPlugins);

  const entryResolved =
    typeof entry === 'string'
      ? resolve(dir, entry)
      : Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, resolve(dir, value)]));

  const defaultFileName = (format: string, entryName?: string) => {
    if (entryName && entryName !== 'index') {
      return `${entryName}.${format === 'es' ? 'es' : 'cjs'}.js`;
    }
    return `index.${format === 'es' ? 'es' : 'cjs'}.js`;
  };

  return defineConfig({
    clearScreen,
    plugins,
    // IMPORTANT: This prevents replacing import.meta.hot with false during build
    // Now code in dist will contain check if (import.meta.hot)
    // and HMR will work even in built version
    define: {
      'import.meta.hot': 'import.meta.hot',
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      ...(resolveAlias
        ? {
            alias: Object.fromEntries(
              Object.entries(resolveAlias).map(([key, value]) => [key, resolve(dir, value)])
            ),
          }
        : {}),
    },
    build: {
      lib: {
        entry: entryResolved,
        name,
        fileName: fileName ?? defaultFileName,
        formats,
      },
      cssCodeSplit,
      rollupOptions: {
        external: (id: string) => {
          // Always externalize vite
          if (id === 'vite') return true;
          // Externalize vue if used
          if (useVue && id === 'vue') return true;
          // Externalize @u-devtools packages
          if (id.startsWith('@u-devtools/')) return true;
          // Externalize all node: modules
          if (id.startsWith('node:')) return true;
          // Externalize custom externals
          if (external.includes(id)) return true;
          return false;
        },
        output: {
          globals: useVue
            ? {
                vue: 'Vue',
              }
            : {},
        },
      },
    },
  });
}
