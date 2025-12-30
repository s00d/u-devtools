import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { cleanTimestampFiles } from './clean-timestamp-plugin';

interface ConfigOptions {
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
    skipDiagnostics?: boolean;
    rollupTypes?: boolean;
    copyDtsFiles?: boolean;
  };
  additionalPlugins?: PluginOption[];
  resolveAlias?: Record<string, string>;
  cssCodeSplit?: boolean;
}

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
      skipDiagnostics: dtsOptions.skipDiagnostics,
      copyDtsFiles: dtsOptions.copyDtsFiles,
      tsconfigPath: resolve(dir, 'tsconfig.json'),
    }),
  );

  plugins.push(cleanTimestampFiles(dir));
  plugins.push(...additionalPlugins);

  const entryResolved =
    typeof entry === 'string'
      ? resolve(dir, entry)
      : Object.fromEntries(
          Object.entries(entry).map(([key, value]) => [key, resolve(dir, value)]),
        );

  const defaultFileName = (format: string, entryName?: string) => {
    if (entryName && entryName !== 'index') {
      return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
    }
    return `index.${format === 'es' ? 'es' : 'cjs'}.js`;
  };

  return defineConfig({
    clearScreen,
    plugins,
    resolve: resolveAlias
      ? {
          alias: Object.fromEntries(
            Object.entries(resolveAlias).map(([key, value]) => [
              key,
              resolve(dir, value),
            ]),
          ),
        }
      : undefined,
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
