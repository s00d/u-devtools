import path from 'node:path';
import os from 'node:os';

/**
 * Normalizes a file path to use forward slashes (/) for cross-platform compatibility.
 * This is especially important for Windows paths that use backslashes (\).
 * Useful when injecting paths into HTML, virtual modules, or URLs.
 *
 * @param filePath - The file path to normalize
 * @returns The normalized path with forward slashes
 */
export function normalizePath(filePath: string): string {
  return path.posix.normalize(
    os.platform() === 'win32' ? filePath.split(path.sep).join(path.posix.sep) : filePath
  );
}

/**
 * Safely resolves a file path relative to a root directory.
 * Throws an error if the resolved path is outside the root directory.
 *
 * @param root - The root directory path
 * @param targetPath - The target path (relative or absolute)
 * @returns The resolved absolute path
 * @throws Error if the path is outside the root directory
 */
export function safeResolve(root: string, targetPath: string): string {
  const normalizedRoot = path.resolve(root);
  const resolvedPath = path.resolve(root, targetPath);

  if (!resolvedPath.startsWith(normalizedRoot)) {
    throw new Error(`Access denied: Path is outside project root`);
  }
  return resolvedPath;
}
