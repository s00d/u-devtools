import type { PackageManagerInfo } from '@u-devtools/utils-node';

export type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export interface PackageMeta {
  name: string;
  type: DependencyType;
  versionRange: string; // from package.json (e.g. "^1.0.0")
  installedVersion: string | null; // from node_modules
  latestVersion?: string; // from npm registry
  description?: string;
  homepage?: string;
  repository?: string;
  author?: string;
  license?: string;
  bin?: Record<string, string>;
  path?: string; // Path on disk
}

// Re-export PackageManagerInfo from utils-node for convenience
export type { PackageManagerInfo };

export interface ProjectInfo {
  pkg: any;
  manager: PackageManagerInfo;
}
