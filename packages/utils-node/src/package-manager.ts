import { existsSync } from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'deno';

export interface PackageManagerInfo {
  name: PackageManager;
  lockfile: string;
}

export interface InstallOptions {
  packages: string[];
  dev?: boolean;
}

export interface UpdateOptions {
  packages: string[];
  dev?: boolean;
  latest?: boolean;
}

/**
 * Detect package manager by checking lockfiles first, then falling back to npm_config_user_agent
 * @param root - Project root directory
 * @returns Package manager info with name and lockfile
 */
export function detectPackageManager(root: string): PackageManagerInfo {
  // First, try to detect by lockfile or config file (most reliable)
  const lockfiles = [
    { file: 'deno.lock', manager: 'deno' as PackageManager },
    { file: 'deno.json', manager: 'deno' as PackageManager },
    { file: 'pnpm-lock.yaml', manager: 'pnpm' as PackageManager },
    { file: 'yarn.lock', manager: 'yarn' as PackageManager },
    { file: 'bun.lockb', manager: 'bun' as PackageManager },
    { file: 'package-lock.json', manager: 'npm' as PackageManager },
  ];

  for (const { file, manager } of lockfiles) {
    if (existsSync(path.join(root, file))) {
      return { name: manager, lockfile: file };
    }
  }

  // Fallback to npm_config_user_agent
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent?.startsWith('pnpm')) {
    return { name: 'pnpm', lockfile: 'pnpm-lock.yaml' };
  }
  if (userAgent?.startsWith('yarn')) {
    return { name: 'yarn', lockfile: 'yarn.lock' };
  }
  if (userAgent?.startsWith('bun')) {
    return { name: 'bun', lockfile: 'bun.lockb' };
  }
  if (userAgent?.startsWith('deno')) {
    return { name: 'deno', lockfile: 'deno.lock' };
  }

  // Default to npm
  return { name: 'npm', lockfile: 'package-lock.json' };
}

/**
 * Build install command for a package manager
 * @param manager - Package manager name
 * @param options - Install options
 * @returns Command string
 */
export function buildInstallCommand(manager: PackageManager, options: InstallOptions): string {
  const { packages, dev } = options;
  const pkgsStr = packages.join(' ');

  switch (manager) {
    case 'npm':
      return `npm install ${pkgsStr}${dev ? ' -D' : ''}`;
    case 'pnpm':
      return `pnpm add ${pkgsStr}${dev ? ' -D' : ''}`;
    case 'yarn':
      return `yarn add ${pkgsStr}${dev ? ' -D' : ''}`;
    case 'bun':
      return `bun add ${pkgsStr}${dev ? ' -D' : ''}`;
    case 'deno':
      // Deno uses 'deno add' command, dev dependencies are not a concept in Deno
      return `deno add ${pkgsStr}`;
  }
}

/**
 * Build uninstall command for a package manager
 * @param manager - Package manager name
 * @param packages - Package names to uninstall
 * @returns Command string
 */
export function buildUninstallCommand(manager: PackageManager, packages: string[]): string {
  const pkgsStr = packages.join(' ');

  switch (manager) {
    case 'npm':
      return `npm uninstall ${pkgsStr}`;
    case 'pnpm':
      return `pnpm remove ${pkgsStr}`;
    case 'yarn':
      return `yarn remove ${pkgsStr}`;
    case 'bun':
      return `bun remove ${pkgsStr}`;
    case 'deno':
      // Deno uses 'deno remove' command
      return `deno remove ${pkgsStr}`;
  }
}

/**
 * Build update command for a package manager
 * @param manager - Package manager name
 * @param options - Update options
 * @returns Command string
 */
export function buildUpdateCommand(manager: PackageManager, options: UpdateOptions): string {
  const { packages, dev, latest } = options;
  const pkgsStr = packages.join(' ');

  switch (manager) {
    case 'npm':
      // npm update doesn't always update package.json, so use install @latest
      return `npm install ${pkgsStr}@latest${dev ? ' -D' : ''}`;
    case 'pnpm':
      return `pnpm update ${pkgsStr}${latest ? ' --latest' : ''}`;
    case 'yarn':
      return `yarn upgrade ${pkgsStr}${latest ? ' --latest' : ''}`;
    case 'bun':
      // Bun update is tricky, use add with latest
      return `bun add ${pkgsStr}${dev ? ' -D' : ''}`;
    case 'deno':
      // Deno update uses 'deno update' command
      return `deno update ${pkgsStr}`;
  }
}

/**
 * Build audit command for a package manager
 * @param manager - Package manager name
 * @param json - Whether to output JSON format
 * @returns Command string or null if not supported
 */
export function buildAuditCommand(manager: PackageManager, json = false): string | null {
  const jsonFlag = json ? ' --json' : '';

  switch (manager) {
    case 'npm':
      return `npm audit${jsonFlag}`;
    case 'pnpm':
      return `pnpm audit${jsonFlag}`;
    case 'yarn':
      return `yarn audit${jsonFlag}`;
    case 'bun':
      return `bun audit${jsonFlag}`;
    case 'deno':
      // Deno audit doesn't support --json flag, but supports --level and other options
      // For JSON output, we'll need to parse the text output or use a different approach
      return json ? null : 'deno audit';
  }
}

/**
 * Execute a shell command
 * @param command - Command to execute
 * @param cwd - Working directory
 * @param options - Execution options
 * @returns Command output
 */
export async function executeCommand(
  command: string,
  cwd: string,
  options?: { maxBuffer?: number }
): Promise<{ stdout: string; stderr: string }> {
  const maxBuffer = options?.maxBuffer ?? 1024 * 1024 * 10; // 10MB default
  return execAsync(command, { cwd, maxBuffer });
}

/**
 * Execute any package manager command
 * @param manager - Package manager name
 * @param command - Command name (e.g., 'view', 'list', 'info')
 * @param args - Command arguments
 * @param cwd - Working directory
 * @param options - Execution options
 * @returns Command output
 */
export async function executeManagerCommand(
  manager: PackageManager,
  command: string,
  args: string[],
  cwd: string,
  options?: { maxBuffer?: number }
): Promise<{ stdout: string; stderr: string }> {
  const argsStr = args.join(' ');
  const fullCommand = `${manager} ${command}${argsStr ? ` ${argsStr}` : ''}`;
  return executeCommand(fullCommand, cwd, options);
}
