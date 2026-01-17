import { globby } from 'globby';
import { join, relative } from 'node:path';

/**
 * Normalize path separators to forward slashes
 */
function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Scans for story files in the project
 * Supports Vue, React (TSX/JSX), and Svelte
 */
export async function scanStories(
  root: string,
  // Добавляем поддержку tsx, jsx, svelte
  pattern = '**/*.stories.{vue,tsx,jsx,svelte}'
): Promise<string[]> {
  // Scan src directory
  const searchDir = join(root, 'src');
  const files = await globby(pattern, { cwd: searchDir, absolute: true });

  return files.map((f: string) => normalizePath(relative(root, f)));
}
