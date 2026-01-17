import type { FileNode } from '../types';

export interface ConfigNode {
  name: string;
  path: string;
  is_directory: boolean;
  selected: boolean;
  expanded: boolean;
  children?: ConfigNode[];
}

export interface R2XConfig {
  version: string;
  rootPath?: string; // Store the root path to validate config belongs to current directory
  nodes: ConfigNode[];
}

/**
 * Convert FileNode to ConfigNode recursively
 */
export function fileNodeToConfigNode(
  node: FileNode,
  nodes: Map<string, FileNode>
): ConfigNode {
  const children: ConfigNode[] = [];
  
  for (const child of nodes.values()) {
    if (child.parent_id === node.id) {
      children.push(fileNodeToConfigNode(child, nodes));
    }
  }

  return {
    name: node.name,
    path: node.relative_path,
    is_directory: node.is_directory,
    selected: node.selected,
    expanded: node.expanded,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Convert ConfigNode to FileNode
 */
export function configNodeToFileNode(
  config: ConfigNode,
  rootPath: string,
  parentId: string | null
): FileNode {
  const fullPath = `${rootPath}/${config.path}`.replace(/\/+/g, '/');

  return {
    id: config.path,
    parent_id: parentId,
    name: config.name,
    path: fullPath,
    relative_path: config.path,
    is_directory: config.is_directory,
    size: null,
    token_count: null,
    selected: config.selected,
    expanded: config.expanded,
  };
}
