import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import { stringify } from 'flatted';
import fs from 'node:fs/promises';
import path from 'node:path';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const server = ctx.server as ViteDevServer;
  const config = server.config;

  // 1. General Info
  rpc.handle('vite:info', async () => {
    let viteVersion = 'unknown';
    try {
      const vitePkg = await import('vite/package.json');
      viteVersion = vitePkg.default?.version || 'unknown';
    } catch {
      // Fallback
    }

    return {
      version: viteVersion,
      nodeVersion: process.version,
      mode: config.mode,
      root: config.root,
      base: config.base,
      configFile: config.configFile || null,
      cacheDir: config.cacheDir,
      serverUrl: server.resolvedUrls?.local?.[0] || null,
      networkUrl: server.resolvedUrls?.network?.[0] || null,
    };
  });

  // 2. Resolved Config (Sanitized)
  rpc.handle('vite:config', () => {
    // Убираем плагины из конфига, чтобы не засорять JSON (они будут отдельно)
    const { plugins, ...rest } = config;
    // Используем flatted для циклических ссылок, затем парсим обратно
    try {
      return JSON.parse(stringify(rest));
    } catch (e) {
      // Если не получилось, возвращаем упрощенную версию
      return {
        root: rest.root,
        base: rest.base,
        mode: rest.mode,
        build: {
          outDir: rest.build?.outDir,
          assetsDir: rest.build?.assetsDir,
          sourcemap: rest.build?.sourcemap,
        },
        server: {
          port: rest.server?.port,
          host: rest.server?.host,
          open: rest.server?.open,
        },
      };
    }
  });

  // 3. Plugins List
  rpc.handle('vite:plugins', () => {
    const plugins = config.plugins || [];
    return plugins
      .filter((p: any) => p && typeof p === 'object')
      .map((p: any, index: number) => ({
        name: p.name || 'Anonymous',
        enforce: p.enforce || 'normal', // pre/post/normal
        apply: typeof p.apply === 'function' ? 'function' : p.apply || 'serve/build',
        index, // Порядок выполнения
      }));
  });

  // 4. Environment Variables
  rpc.handle('vite:env', () => {
    // Загружаем то, что видит приложение
    const env = loadEnv(config.mode, config.root, '');
    return env;
  });

  // --- ACTIONS ---

  // 5. Restart Server
  rpc.handle('vite:restart', async () => {
    if (server.restart) {
      await server.restart();
      return { success: true };
    }
    throw new Error('Server restart not available');
  });

  // 6. Clear Cache (node_modules/.vite)
  rpc.handle('vite:clearCache', async () => {
    if (config.cacheDir) {
      try {
        await fs.rm(config.cacheDir, { recursive: true, force: true });
        return { success: true, path: config.cacheDir };
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to clear cache: ${error}`);
      }
    }
    return { success: false, message: 'No cache dir found' };
  });
}

