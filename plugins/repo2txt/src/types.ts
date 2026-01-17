/**
 * File node representing a file or directory in the tree
 */
export interface FileNode {
  id: string;
  parent_id: string | null;
  name: string;
  path: string;
  relative_path: string;
  is_directory: boolean;
  size: number | null; // null means size not loaded yet
  token_count: number | null;
  selected: boolean;
  expanded: boolean;
}

/**
 * File update event data
 */
export interface FileUpdate {
  id: string;
  size: number;
  token_count: number;
}

/**
 * Progress event for generation
 */
export interface ProgressEvent {
  current: number;
  total: number;
  stage: 'preparing' | 'processing' | 'writing' | 'completed';
}

/**
 * Application statistics
 */
export interface AppStats {
  files: number;
  size: number;
  tokens: number;
}

/**
 * Generation result
 */
export interface GenerateResult {
  preview_content: string;
  is_truncated: boolean;
  stats: AppStats;
  config?: { version: string; nodes: unknown[] }; // Config for storage (optional)
}

/**
 * Application configuration
 */
export interface AppConfig {
  ignored_names: string[];
  ignored_folders: string[];
  binary_extensions: string[];
  token_limit?: number;
  max_file_size?: number;
  output_template?: string;
  output_filename?: string;
}

/**
 * RPC method parameters
 */
export interface OpenDirectoryParams {
  path?: string;
  config?: AppConfig;
}

export interface UpdateSelectionParams {
  id: string;
  selected: boolean;
}

export interface ToggleExpandedParams {
  id: string;
  expanded: boolean;
}

export interface ScanDirectoryParams {
  id: string;
  config?: AppConfig;
}

export interface GenerateMarkdownParams {
  outputPath?: string;
  config?: AppConfig;
  selectedNodeIds?: string[]; // Optional: send current selection state from client
}

export interface SearchNodesParams {
  query: string;
}

export interface ReadFileParams {
  id: string;
}

export interface GetParentDirectoryParams {
  path: string;
}

/**
 * Protocol definition for repo2txt plugin
 */
export interface repo2txtProtocol {
  // Events sent from Server to Client
  'repo2txt:files-updated': (data: FileUpdate[]) => void;
  'repo2txt:analysis-completed': () => void;
  'repo2txt:generation-progress': (data: ProgressEvent) => void;
  
  // Events sent from Client to App
  'repo2txt:action': (data: unknown) => void;
  'repo2txt:ready': (data: { message: string }) => void;
}

