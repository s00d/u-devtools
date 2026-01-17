import path from 'node:path';
import fs from 'node:fs/promises';
import type { FileNode, AppConfig, AppStats } from '../types';
import { getLanguageByExtension } from './file-scanner';
import { isBinaryFile } from './tokenizer';
// Note: countTokens is not used during generation - we use heuristic (size / 4) for speed

/**
 * Build tree structure string from selected nodes
 */
export function buildTreeStructure(nodes: FileNode[], rootPath: string): string {
  const lines: string[] = [];
  
  // Create map of children by parent
  const childrenMap = new Map<string | null, FileNode[]>();
  for (const node of nodes) {
    const parentId = node.parent_id || null;
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(node);
  }
  
  // Sort function: directories first, then alphabetically
  const sortNodes = (a: FileNode, b: FileNode) => {
    if (a.is_directory !== b.is_directory) {
      return a.is_directory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };
  
  // Recursive traversal
  const traverse = (
    parentId: string | null,
    prefix: string,
    isLast: boolean
  ) => {
    const children = (childrenMap.get(parentId) || []).sort(sortNodes);
    
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const isLastChild = i === children.length - 1;
      const marker = node.selected ? '[✓]' : '[ ]';
      const icon = node.is_directory ? '▶ ' : '';
      const currentPrefix = isLastChild ? '└── ' : '├── ';
      const nextPrefix = isLastChild ? '    ' : '│   ';
      
      lines.push(`${prefix}${currentPrefix}${marker} ${icon}${node.name}`);
      
      // Show children if directory is expanded or selected
      if (node.is_directory && (node.expanded || node.selected)) {
        const childNodes = (childrenMap.get(node.id) || []).sort(sortNodes);
        if (childNodes.length > 0) {
          traverse(node.id, `${prefix}${nextPrefix}`, false);
        }
      }
    }
  };
  
  // Start with root nodes
  traverse(null, '', true);
  
  return lines.join('\n');
}

/**
 * Generate markdown content from selected files
 */
export async function generateMarkdown(
  nodes: FileNode[],
  rootPath: string,
  config: AppConfig
): Promise<{ preview: string; fullContent: string; isTruncated: boolean; stats: AppStats }> {
  // Filter selected files
  const selectedFiles = nodes.filter((n) => {
    if (n.is_directory || !n.selected) {
      return false;
    }
    // Check if parent is selected
    if (n.parent_id) {
      const parent = nodes.find((p) => p.id === n.parent_id);
      if (parent && !parent.selected) {
        return false;
      }
    }
    return true;
  });
  
  // Build tree structure
  const tree = buildTreeStructure(nodes, rootPath);
  
  // Header
  const header = `# Collected Files\n\n## File Structure\n\n\`\`\`\n${tree}\n\`\`\`\n\n---\n\n`;
  
  const chunks: string[] = [];
  let totalSize = 0;
  let totalTokens = 0;
  const PREVIEW_LIMIT = 50 * 1024; // 50 KB preview
  let previewSize = 0;
  let isTruncated = false;
  
  // Process files in parallel batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
    const batch = selectedFiles.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(
      batch.map(async (node) => {
        // node.path already contains full absolute path, no need to join with rootPath
        const fullPath = node.path;
        
        try {
          // Check file size
          const stats = await fs.stat(fullPath);
          if (stats.size > (config.max_file_size || 1024 * 1024)) {
            return {
              relativePath: node.relative_path,
              content: `## ${node.relative_path}\n\n*File too large (${stats.size} bytes, limit: ${config.max_file_size || 1024 * 1024} bytes) - skipped*\n\n---\n\n`,
              size: stats.size,
              tokens: 0,
            };
          }
          
          // Read file
          const buffer = await fs.readFile(fullPath);
          
          // Check if binary
          if (isBinaryFile(buffer)) {
            return {
              relativePath: node.relative_path,
              content: `## ${node.relative_path}\n\n*Binary file*\n\n---\n\n`,
              size: stats.size,
              tokens: 0,
            };
          }
          
          const content = buffer.toString('utf-8');
          const language = getLanguageByExtension(node.relative_path);
          
          // Apply template
          const template = config.output_template || '## {{path}}\n\n```{{language}}\n{{content}}\n```\n\n---\n\n';
          const formatted = template
            .replace(/\{\{path\}\}/g, node.relative_path)
            .replace(/\{\{language\}\}/g, language)
            .replace(/\{\{content\}\}/g, content);
          
          // Use heuristic token counting (fast) instead of real counting (slow)
          // Real token counting can be done separately via separate RPC call if needed
          const tokens = Math.ceil(content.length / 4);
          
          return {
            relativePath: node.relative_path,
            content: formatted,
            size: stats.size,
            tokens,
          };
        } catch (error) {
          return {
            relativePath: node.relative_path,
            content: `## ${node.relative_path}\n\n*Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}*\n\n---\n\n`,
            size: 0,
            tokens: 0,
          };
        }
      })
    );
    
    // Sort by path for deterministic output
    results.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    
    // Add to chunks and update stats
    for (const result of results) {
      chunks.push(result.content);
      totalSize += result.size;
      totalTokens += result.tokens;
      
      // Build preview
      if (!isTruncated) {
        const contentBytes = Buffer.byteLength(result.content, 'utf-8');
        if (previewSize + contentBytes <= PREVIEW_LIMIT) {
          previewSize += contentBytes;
        } else {
          isTruncated = true;
        }
      }
    }
  }
  
  // Combine all chunks
  const fullContent = header + chunks.join('');
  
  // Build preview
  const preview = isTruncated
    ? fullContent.slice(0, PREVIEW_LIMIT) + '\n\n... (truncated)'
    : fullContent;
  
  return {
    preview,
    fullContent,
    isTruncated,
    stats: {
      files: selectedFiles.length,
      size: totalSize,
      tokens: totalTokens,
    },
  };
}
