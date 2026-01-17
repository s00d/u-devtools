import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { loadFile, writeFile, builders } from 'magicast';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  detectPackageManager,
  buildInstallCommand,
  buildUninstallCommand,
  executeCommand,
  executeManagerCommand,
} from '@u-devtools/utils-node';
import {
  ManagerSearchPayloadSchema,
  ManagerInstallPayloadSchema,
  ManagerUninstallPayloadSchema,
  ManagerCheckUpdatesPayloadSchema,
  ManagerGetNpmInfoPayloadSchema,
} from './schemas';

const require = createRequire(import.meta.url);

/**
 * Setup manager plugin server side
 */
export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // 1. Search plugins in NPM (via npm search)
  rpc.handle('manager:search', async (payload: unknown) => {
    const validationResult = ManagerSearchPayloadSchema.safeParse(payload);
    const text = validationResult.success ? validationResult.data : 'keywords:u-devtools-plugin';

    try {
      // Use 'npm search' with --json flag.
      // npm is usually installed even if pnpm/yarn is used.
      // This is more reliable for parsing than pnpm/yarn search output.
      const { stdout } = await executeManagerCommand('npm', 'search', [text, '--json'], ctx.root);

      const data = JSON.parse(stdout);

      // Convert npm search format to our interface
      return Array.isArray(data)
        ? data.map(
            (pkg: {
              name: string;
              version: string;
              description?: string;
              maintainers?: Array<{ username: string }>;
              author?: { name: string };
              links?: { npm?: string };
            }) => ({
              name: pkg.name,
              version: pkg.version,
              description: pkg.description || 'No description',
              author: pkg.maintainers?.[0]?.username || pkg.author?.name || 'Unknown',
              homepage: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
            })
          )
        : [];
    } catch (e) {
      console.warn('[u-devtools] npm search failed:', e);
      return [];
    }
  });

  // 2. Install plugin
  rpc.handle('manager:install', async (payload: unknown) => {
    const validationResult = ManagerInstallPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const pkgName = validationResult.data;

    // Helper for converting package name to variable name
    const packageToImportName = (pkgName: string): string => {
      const name = pkgName.split('/').pop()?.replace('plugin-', '') || '';
      return `${name.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Plugin`;
    };

    const managerInfo = detectPackageManager(ctx.root);
    const manager = managerInfo.name;
    const cmd = buildInstallCommand(manager, { packages: [pkgName], dev: true });

    try {
      // 1. Install package via CLI
      await executeCommand(cmd, ctx.root);

      // 2. Modify vite.config.ts
      const configPath = path.resolve(ctx.root, 'vite.config.ts');
      if (fs.existsSync(configPath)) {
        try {
          const mod = await loadFile(configPath);
          const importName = packageToImportName(pkgName);

          // Add import
          mod.imports.$add({
            from: pkgName,
            imported: importName,
          });

          // Support for both bare object export and `defineConfig` wrapper
          const options =
            mod.exports.default.$type === 'function-call'
              ? mod.exports.default.$args[0]
              : mod.exports.default;

          if (options?.plugins) {
            const pluginsArray = options.plugins;
            if (Array.isArray(pluginsArray)) {
              pluginsArray.push(builders.functionCall(importName, []));
            } else if (pluginsArray.$type === 'array') {
              pluginsArray.push(builders.functionCall(importName, []));
            }
          } else {
            console.warn(
              `[u-devtools] Could not auto-inject plugin "${pkgName}" into vite.config.ts. Please add it manually.`
            );
          }

          await writeFile(mod, configPath);
        } catch (configError: unknown) {
          const message = configError instanceof Error ? configError.message : String(configError);
          console.warn(
            `[u-devtools] Failed to modify vite.config.ts: ${message}. Plugin installed, but you may need to add it manually.`
          );
        }
      }

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: message };
    }
  });

  // 3. Uninstall plugin
  rpc.handle('manager:uninstall', async (payload: unknown) => {
    const validationResult = ManagerUninstallPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const pkgName = validationResult.data;
    const managerInfo = detectPackageManager(ctx.root);
    const manager = managerInfo.name;
    const cmd = buildUninstallCommand(manager, [pkgName]);

    try {
      // Remove package
      await executeCommand(cmd, ctx.root);

      // Note: Automatic removal from vite.config.ts via magicast is complex,
      // as we need to find and remove specific function call from array.
      // For MVP just remove package, user can clean config manually.

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: message };
    }
  });

  // 4. Check updates (via npm view)
  rpc.handle('manager:checkUpdates', async (payload: unknown) => {
    const validationResult = ManagerCheckUpdatesPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const packages = validationResult.data;
    const updates: Record<string, string> = {};

    // Run checks in parallel
    await Promise.all(
      packages.map(async (pkgName) => {
        if (!pkgName || pkgName === 'unknown') return;
        try {
          // 'npm view <pkg> version' returns latest version as string
          const { stdout } = await executeManagerCommand(
            'npm',
            'view',
            [pkgName, 'version'],
            ctx.root
          );
          const latestVersion = stdout.trim();
          if (latestVersion) {
            updates[pkgName] = latestVersion;
          }
        } catch (e) {
          // Package not found or network error
        }
      })
    );

    return updates;
  });

  // 5. Get detailed package info from NPM
  rpc.handle('manager:getNpmInfo', async (payload: unknown) => {
    const validationResult = ManagerGetNpmInfoPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const pkgName = validationResult.data;

    try {
      const response = await fetch(`https://registry.npmjs.org/${pkgName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch package info: ${response.statusText}`);
      }

      const data = await response.json();
      const latestVersion = data['dist-tags']?.latest;
      const latest = data.versions?.[latestVersion];

      // Get README from latest version
      let readme = '';
      if (latest?.readme) {
        readme = latest.readme;
      } else if (data.readme) {
        readme = data.readme;
      }

      // Get download statistics
      const downloadsResponse = await fetch(
        `https://api.npmjs.org/downloads/point/last-week/${pkgName}`
      );
      let downloads = 0;
      if (downloadsResponse.ok) {
        const downloadsData = await downloadsResponse.json();
        downloads = downloadsData.downloads || 0;
      }

      // Get GitHub stars (if repository exists)
      let stars = 0;
      if (latest?.repository?.url) {
        const repoUrl = latest.repository.url;
        const githubMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (githubMatch) {
          const [, owner, repo] = githubMatch;
          try {
            const githubResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}`
            );
            if (githubResponse.ok) {
              const githubData = await githubResponse.json();
              stars = githubData.stargazers_count || 0;
            }
          } catch (e) {
            // Ignore GitHub API errors
          }
        }
      }

      return {
        name: pkgName,
        version: latestVersion || 'unknown',
        description: latest?.description || data.description || '',
        readme,
        downloads,
        stars,
        keywords: latest?.keywords || data.keywords || [],
        homepage: latest?.homepage || data.homepage || '',
        repository: latest?.repository?.url || data.repository?.url || '',
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn(`[u-devtools] Failed to fetch npm info for ${pkgName}:`, message);
      return null;
    }
  });

  // 6. Plugin generator (scaffolding)
  rpc.handle('manager:scaffold', async (payload: unknown) => {
    const {
      projectName,
      pluginName,
      packageName,
      description,
      template = 'vue',
      features = [],
    } = payload as {
      projectName: string;
      pluginName: string;
      packageName: string;
      description: string;
      template?: string;
      features?: string[];
    };

    try {
      // Use hygen for generation
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const createPackagePath = path.resolve(__dirname, '../../../packages/create');
      const templatesPath = path.resolve(createPackagePath, '_templates');

      // Form hygen command
      const featuresStr = features.join(',');
      const cmd = `cd "${ctx.root}" && npx hygen plugin new --projectName "${projectName}" --pluginName "${pluginName}" --packageName "${packageName}" --description "${description}" --template "${template}" --features "${featuresStr}"`;

      await executeCommand(cmd, ctx.root);

      return { success: true, path: path.resolve(ctx.root, projectName) };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: message };
    }
  });

  // 7. Add local plugin
  rpc.handle('manager:addLocal', async (payload: unknown) => {
    const { relativePath, importName } = payload as {
      relativePath: string;
      importName?: string;
    };

    try {
      const configPath = path.resolve(ctx.root, 'vite.config.ts');
      if (!fs.existsSync(configPath)) {
        return { success: false, error: 'vite.config.ts not found' };
      }

      const mod = await loadFile(configPath);
      const finalImportName = importName || path.basename(relativePath, path.extname(relativePath));

      // Add import
      mod.imports.$add({
        from: relativePath,
        imported: finalImportName,
      });

      // Support for both bare object export and `defineConfig` wrapper
      const options =
        mod.exports.default.$type === 'function-call'
          ? mod.exports.default.$args[0]
          : mod.exports.default;

      if (options?.plugins) {
        const pluginsArray = options.plugins;
        if (Array.isArray(pluginsArray)) {
          pluginsArray.push(builders.functionCall(finalImportName, []));
        } else if (pluginsArray.$type === 'array') {
          pluginsArray.push(builders.functionCall(finalImportName, []));
        }
      } else {
        return { success: false, error: 'Could not find plugins array in vite.config.ts' };
      }

      await writeFile(mod, configPath);

      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { success: false, error: message };
    }
  });

  // 8. View plugin configuration
  rpc.handle('manager:getPluginConfig', async (payload: unknown) => {
    const { pluginName } = payload as { pluginName: string };

    try {
      const configPath = path.resolve(ctx.root, 'vite.config.ts');
      if (!fs.existsSync(configPath)) {
        return null;
      }

      const mod = await loadFile(configPath);
      // Support for both bare object export and `defineConfig` wrapper
      const options =
        mod.exports.default.$type === 'function-call'
          ? mod.exports.default.$args[0]
          : mod.exports.default;

      if (!options?.plugins) {
        return null;
      }

      const pluginsArray = options.plugins;
      const plugins = Array.isArray(pluginsArray)
        ? pluginsArray
        : pluginsArray.$type === 'array'
          ? pluginsArray.$items
          : [];

      // Find plugin by name
      for (const plugin of plugins) {
        if (plugin.$type === 'function-call') {
          // Check if plugin name matches
          // This is simplified check, in reality need better parsing
          const callName = plugin.$callee?.name || '';
          if (callName.toLowerCase().includes(pluginName.toLowerCase())) {
            // Return function arguments
            return {
              name: callName,
              args: plugin.$args || [],
            };
          }
        }
      }

      return null;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn(`[u-devtools] Failed to get plugin config:`, message);
      return null;
    }
  });
}
