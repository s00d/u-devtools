import type { DevToolsPlugin, RpcServerInterface, ServerContext } from '@u-devtools/core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';

/**
 * Options for defining a DevTools plugin using the `definePlugin` helper.
 * 
 * This is the recommended way to create plugins as it handles path resolution
 * automatically for both development (.ts) and production (.js) modes.
 * 
 * @example
 * ```typescript
 * import { definePlugin } from '@u-devtools/kit/define-plugin';
 * 
 * export default definePlugin({
 *   name: 'My Plugin',
 *   root: import.meta.url,  // Required: pass import.meta.url
 *   client: './client',     // Relative to this file
 *   app: './app',           // Optional
 *   server: './server',     // Optional
 *   meta: {
 *     name: '@my-org/my-plugin',
 *     version: '1.0.0',
 *     description: 'My custom DevTools plugin',
 *     repository: 'https://github.com/my-org/my-plugin',
 *   },
 * });
 * ```
 */
export interface DefinePluginOptions {
  /** Display name of the plugin (shown in DevTools UI) */
  name: string;
  
  /**
   * Must pass `import.meta.url` so we can resolve paths.
   * This is used to determine the plugin's directory and resolve relative paths.
   */
  root: string;

  /**
   * Relative path to client file (with or without extension).
   * @default './client'
   * @example './client' or './client.ts'
   * 
   * If `null` is passed, client file will not be loaded.
   * The client file should export a `PluginClientInstance` as default.
   */
  client?: string | null;

  /**
   * Relative path to app file (with or without extension).
   * @example './app' or './app.ts'
   * 
   * If `null` is passed, app file will not be loaded.
   * The app file should export a `AppPluginDefinition` using `defineApp`.
   */
  app?: string | null;

  /**
   * Relative path to server file (with or without extension).
   * If specified, will be automatically loaded and `setupServer` export will be called.
   * @default './server'
   * @example './server' or './node'
   * 
   * If `null` is passed, server file will not be loaded.
   * The server file should export a `setupServer` function.
   */
  server?: string | null;

  /** Plugin metadata (name, version, description, author, homepage, repository) */
  meta?: DevToolsPlugin['meta'];

  /**
   * Vite plugins to inject into the dev server.
   * These plugins will be merged with the main DevTools plugin.
   * 
   * Uses `any` to avoid type conflicts between different vite installations in monorepo.
   */
  vitePlugins?: (() => any)[];

  /**
   * Force use production paths (dist/file.js) even in dev mode.
   * Useful for debugging built plugin version.
   * @default false
   */
  useDist?: boolean;
}

/**
 * Smart factory for creating DevTools plugins.
 * 
 * Automatically resolves paths for Dev (.ts) and Prod (.js) modes.
 * Handles path resolution, file loading, and server setup automatically.
 * 
 * **⚠️ Important:** This function uses Node.js APIs (`node:url`, `node:path`) 
 * and should only be called in server-side code (Vite plugin context).
 * 
 * Import from `@u-devtools/kit/define-plugin` (not from `@u-devtools/kit`).
 * 
 * @param options - Plugin configuration options
 * @returns Configured `DevToolsPlugin` object
 * 
 * @example
 * ```ts
 * // In your plugin's index.ts (server-side)
 * import { definePlugin } from '@u-devtools/kit/define-plugin';
 * 
 * export default definePlugin({
 *   name: 'My Plugin',
 *   root: import.meta.url,  // Required!
 *   client: './client',      // Optional, defaults to './client'
 *   app: './app',            // Optional
 *   server: './server',      // Optional, defaults to './server'
 *   meta: {
 *     name: '@my-org/my-plugin',
 *     version: '1.0.0',
 *     description: 'My custom DevTools plugin'
 *   }
 * });
 * ```
 */
export function definePlugin(options: DefinePluginOptions): DevToolsPlugin {
  const { root, client, app, server, useDist, ...rest } = options;

  // Convert file URL to filesystem path
  const __filename = fileURLToPath(root);
  const __dirname = dirname(__filename);

  // Determine mode by current file extension (index.ts or index.js)
  const isDev = __filename.endsWith('.ts');

  // If useDist is enabled, we force .js, otherwise as usual
  const targetExt = isDev && !useDist ? '.ts' : '.js';

  // Helper for forming absolute path
  const resolvePath = (relativePath: string) => {
    // Remove extension if user accidentally wrote it
    const cleanPath = relativePath.replace(/\.(ts|js)$/, '');

    let baseDir = __dirname;

    // MAGIC: If we're in dev (src/*.ts) but want dist:
    // Try to exit 'src' folder and enter 'dist'
    if (isDev && useDist) {
      // Check that we're actually in src folder
      if (basename(baseDir) === 'src') {
        // Go up one level and enter dist
        baseDir = resolve(baseDir, '../dist');
      }
    }

    return resolve(baseDir, cleanPath + targetExt);
  };

  // Default values (if null, then undefined - don't load)
  const clientPath =
    client === null ? undefined : client ? resolvePath(client) : resolvePath('./client');
  const serverPath =
    server === null ? undefined : server ? resolvePath(server) : resolvePath('./server');

  // If server is specified (explicitly or by default), create setupServer that will load the module
  let finalSetupServer: ((rpc: RpcServerInterface, ctx: ServerContext) => void) | undefined;
  if (serverPath) {
    // Save path for lazy loading on first call
    const serverModulePath = serverPath;
    finalSetupServer = (rpc: RpcServerInterface, ctx: ServerContext) => {
      // Use dynamic import to load ESM module
      // This is async, but setupServer can be called asynchronously in Vite plugin
      const serverUrl = pathToFileURL(serverModulePath).href;

      import(serverUrl)
        .then((serverModule) => {
          // Look for setupServer or default export
          const setupFn = serverModule.setupServer || serverModule.default;
          if (typeof setupFn === 'function') {
            setupFn(rpc, ctx);
          } else {
            console.warn(
              `[u-devtools:kit] Server module at ${serverModulePath} does not export setupServer function. Found exports:`,
              Object.keys(serverModule)
            );
          }
        })
        .catch((error) => {
          console.error(
            `[u-devtools:kit] Failed to load server module from ${serverModulePath}:`,
            error
          );
        });
    };
  }

  return {
    ...rest,
    clientPath,
    appPath: app ? resolvePath(app) : undefined,
    setupServer: finalSetupServer,
  };
}

