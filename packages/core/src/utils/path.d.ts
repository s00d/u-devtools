/**
 * Safely resolves a file path relative to a root directory.
 * Throws an error if the resolved path is outside the root directory.
 *
 * @param root - The root directory path
 * @param targetPath - The target path (relative or absolute)
 * @returns The resolved absolute path
 * @throws Error if the path is outside the root directory
 */
export declare function safeResolve(root: string, targetPath: string): string;
//# sourceMappingURL=path.d.ts.map