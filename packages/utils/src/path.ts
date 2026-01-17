/**
 * Normalizes a file path to use forward slashes (/) for cross-platform compatibility.
 * Client-side version (browser-safe).
 *
 * @param filePath - The file path to normalize
 * @returns The normalized path with forward slashes
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/\/+/g, '/');
}
