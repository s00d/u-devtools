import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { FileSystemService } from '@u-devtools/utils-node';
import path from 'node:path';
import {
  detectPackageManager,
  buildInstallCommand,
  buildUninstallCommand,
  buildUpdateCommand,
  executeCommand,
  executeManagerCommand,
} from '@u-devtools/utils-node';
import type { PackageMeta } from './types';
import { CheckLatestPayloadSchema, ExecutePayloadSchema } from './schemas';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const fs = new FileSystemService(ctx.root);

  // Read package.json from node_modules to get real version
  const getInstalledVersion = async (pkgName: string): Promise<any | null> => {
    try {
      // Try to find package.json inside node_modules
      // Simple resolve may not work due to exports, so build path manually
      // This is simplified logic, but works for most flat structures (npm/pnpm)
      const potentialPaths = [
        path.join('node_modules', pkgName, 'package.json'),
        // For nested paths (@scope/pkg)
        path.join('node_modules', ...pkgName.split('/'), 'package.json'),
      ];

      for (const p of potentialPaths) {
        if (fs.exists(p)) {
          const content = await fs.readJson(p);
          return content;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // 1. Read list
  rpc.handle('pkg:list', async () => {
    if (!fs.exists('package.json')) throw new Error('package.json not found');

    const pkg = await fs.readJson<{
      name?: string;
      version?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    }>('package.json');
    
    if (!pkg) throw new Error('Failed to parse package.json');
    const manager = detectPackageManager(ctx.root);

    // Collect all dependencies into flat list with metadata
    const result: PackageMeta[] = [];
    const types = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ] as const;

    for (const type of types) {
      if (!pkg[type]) continue;

      for (const [name, versionRange] of Object.entries(pkg[type] || {})) {
        const installedPkg = await getInstalledVersion(name);

        result.push({
          name,
          type,
          versionRange: versionRange as string,
          installedVersion: installedPkg?.version || null,
          description: installedPkg?.description,
          homepage: installedPkg?.homepage,
          repository: installedPkg?.repository?.url || installedPkg?.repository,
          author:
            typeof installedPkg?.author === 'object'
              ? installedPkg.author.name
              : installedPkg?.author,
          license: installedPkg?.license,
          bin: installedPkg?.bin,
        });
      }
    }

    return { packages: result, manager, pkgName: pkg.name, pkgVersion: pkg.version };
  });

  // 2. Check updates (npm view)
  // Can do in batches to avoid slowdown
  rpc.handle('pkg:check-latest', async (payload: unknown) => {
    const validationResult = CheckLatestPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const pkgNames = validationResult.data;
    const updates: Record<string, string> = {};

    // Limit concurrency
    const batchSize = 5;
    for (let i = 0; i < pkgNames.length; i += batchSize) {
      const batch = pkgNames.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (name) => {
          try {
            // Use executeManagerCommand for npm view
            const { stdout } = await executeManagerCommand(
              'npm',
              'view',
              [name, 'version'],
              ctx.root
            );
            updates[name] = stdout.trim();
          } catch (e) {
            // ignore
          }
        })
      );
    }

    return updates;
  });

  // 3. Execute commands (Install/Uninstall/Update)
  rpc.handle('pkg:execute', async (payload: unknown) => {
    const validationResult = ExecutePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { cmd, pkgs, dev } = validationResult.data;
    const managerInfo = detectPackageManager(ctx.root);
    const manager = managerInfo.name;

    let command = '';

    if (cmd === 'install') {
      command = buildInstallCommand(manager, { packages: pkgs, dev });
    } else if (cmd === 'uninstall') {
      command = buildUninstallCommand(manager, pkgs);
    } else if (cmd === 'update') {
      command = buildUpdateCommand(manager, { packages: pkgs, dev, latest: true });
    }

    try {
      await executeCommand(command, ctx.root);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
}
