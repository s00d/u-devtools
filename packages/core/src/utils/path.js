import path from 'node:path';
/**
 * Safely resolves a file path relative to a root directory.
 * Throws an error if the resolved path is outside the root directory.
 *
 * @param root - The root directory path
 * @param targetPath - The target path (relative or absolute)
 * @returns The resolved absolute path
 * @throws Error if the path is outside the root directory
 */
export function safeResolve(root, targetPath) {
    const normalizedRoot = path.resolve(root);
    const resolvedPath = path.resolve(root, targetPath);
    if (!resolvedPath.startsWith(normalizedRoot)) {
        throw new Error(`Access denied: Path is outside project root`);
    }
    return resolvedPath;
}
