import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type {
  FileNode,
  AppConfig,
  AppStats,
  GenerateResult,
  OpenDirectoryParams,
  ScanDirectoryParams,
  ReadFileParams,
  GenerateMarkdownParams,
  SearchNodesParams,
  UpdateSelectionParams,
  ToggleExpandedParams,
} from './types';
import {
  loadIgnorePatterns,
  shouldIgnoreFile,
  generateNodeId,
} from './utils/file-scanner';
import { isBinaryFile } from './utils/tokenizer';
import { generateMarkdown } from './utils/markdown-generator';
import { getDefaultConfig } from './utils/default-config';
import {
  fileNodeToConfigNode,
  type R2XConfig,
  type ConfigNode,
} from './utils/r2x-config';
import ignore from 'ignore';

// --- INLINE OPTIMIZED SCANNER ---
// Using heuristics instead of reading every file makes scanning instant.
function estimateTokens(size: number): number {
  return Math.ceil(size / 4);
}

class OptimizedScanner {
  private nodeMap = new Map<string, FileNode>();
  private fileCount = 0;
  private MAX_FILES = 20000; // Hard limit to prevent RPC choke

  constructor(
    private rootPath: string,
    private config: AppConfig,
    private ig: ReturnType<typeof ignore>
  ) {}

  async scan(
    dirPath: string = this.rootPath,
    parentId: string | null = null,
    depth: number = 0
  ): Promise<FileNode[]> {
    // Safety break
    if (depth > 20) return [];
    if (this.fileCount >= this.MAX_FILES) return [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const nodes: FileNode[] = [];
      const subDirs: string[] = [];
      const subDirIds: string[] = [];

      for (const entry of entries) {
        if (this.fileCount >= this.MAX_FILES) break;

        const fileName = entry.name;

        // --- CRITICAL OPTIMIZATION: HARD IGNORE ---
        // Skip heavy folders immediately before any other checks
        if (
          fileName === 'node_modules' ||
          fileName === '.git' ||
          fileName === '.idea' ||
          fileName === '.vscode' ||
          fileName === 'dist' ||
          fileName === '.next' ||
          fileName === '.nuxt'
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, fileName);
        const relativePath = path.relative(this.rootPath, fullPath).replace(/\\/g, '/');
        const isDirectory = entry.isDirectory();

        // Standard ignore check (gitignore)
        if (shouldIgnoreFile(relativePath, fileName, isDirectory, this.config, this.ig)) {
          continue;
        }

        const id = generateNodeId(relativePath);

        let size = 0;
        let token_count = 0;

        if (!isDirectory) {
          try {
            // fs.stat is fast enough
            const stats = await fs.stat(fullPath);
            size = stats.size;
            // Heuristic token counting (0ms cost) instead of reading file
            token_count = estimateTokens(size);
          } catch {
            // Ignore errors
          }
          this.fileCount++;
        }

        const node: FileNode = {
          id,
          parent_id: parentId,
          name: fileName,
          path: fullPath,
          relative_path: relativePath,
          is_directory: isDirectory,
          size,
          token_count,
          selected: true,
          expanded: false,
        };

        this.nodeMap.set(id, node);
        nodes.push(node);

        if (isDirectory) {
          subDirs.push(fullPath);
          subDirIds.push(id);
        }
      }

      // Parallel scan for subdirectories
      if (subDirs.length > 0) {
        const results = await Promise.all(
          subDirs.map((subPath, index) => this.scan(subPath, subDirIds[index], depth + 1))
        );
        for (const res of results) {
          nodes.push(...res);
        }
      }

      return nodes;
    } catch (error) {
      console.warn(`[repo2txt] Failed to scan ${dirPath}:`, error);
      return [];
    }
  }

  public getNodesMap() {
    return this.nodeMap;
  }
}

// Format helpers
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// State storage
const nodeState = new Map<string, Map<string, FileNode>>();
const lastGeneratedContent = new Map<string, string>();

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('repo2txt:get-default-config', () => getDefaultConfig());
  rpc.handle('repo2txt:get-current-directory', () => ctx.root);
  rpc.handle('repo2txt:get-parent-directory', (payload: any) => {
    const p = path.dirname(payload.path);
    return p === payload.path || p === '.' ? null : p;
  });
  rpc.handle('repo2txt:reveal-in-explorer', async () => ({ success: true }));

  // --- OPEN DIRECTORY (OPTIMIZED) ---
  rpc.handle('repo2txt:open-directory', async (payload: unknown) => {
    const params = payload as OpenDirectoryParams;
    const targetPath = params.path || ctx.root;
    const config = params.config || getDefaultConfig();

    if (!existsSync(targetPath)) throw new Error('Directory does not exist');

    console.log('[repo2txt] Scanning:', targetPath);
    console.time('[repo2txt] Scan Time');

    const ig = await loadIgnorePatterns(targetPath);

    // Initialize optimized scanner
    const scanner = new OptimizedScanner(targetPath, config, ig);
    const nodes = await scanner.scan();

    console.timeEnd('[repo2txt] Scan Time');
    console.log(`[repo2txt] Found ${nodes.length} files`);

    // Config is now loaded from api.storage on the client side (in useRepo.ts)
    // No need to load .r2x file from server

    // Save to memory state
    nodeState.set(targetPath, scanner.getNodesMap());

    // Sort: directories first
    nodes.sort((a, b) => {
      if (a.is_directory !== b.is_directory) return a.is_directory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    // Notify UI that analysis is "done" immediately
    // We removed the heavy background process, so we are done now.
    console.log('[repo2txt] ✅ Scan completed, preparing to broadcast analysis-completed event');
    console.log('[repo2txt] 📡 Broadcasting repo2txt:analysis-completed event immediately');
    try {
      rpc.broadcast('repo2txt:analysis-completed', {});
      console.log('[repo2txt] ✅ Successfully broadcasted analysis-completed event');
    } catch (error) {
      console.error('[repo2txt] ❌ Failed to broadcast analysis-completed event:', error);
    }
    
    // Also send after a small delay as fallback
    setTimeout(() => {
      console.log('[repo2txt] 📡 Broadcasting repo2txt:analysis-completed event (delayed fallback)');
      try {
        rpc.broadcast('repo2txt:analysis-completed', {});
        console.log('[repo2txt] ✅ Successfully broadcasted analysis-completed event (delayed)');
      } catch (error) {
        console.error('[repo2txt] ❌ Failed to broadcast analysis-completed event (delayed):', error);
      }
    }, 100);

    return nodes;
  });

  // --- SCAN SUBDIRECTORY ---
  rpc.handle('repo2txt:scan-directory', async (payload: unknown) => {
    const params = payload as ScanDirectoryParams;
    const config = params.config || getDefaultConfig();

    let rootPath = '';
    let parentNode: FileNode | undefined;

    for (const [rp, map] of nodeState.entries()) {
      if (map.has(params.id)) {
        rootPath = rp;
        parentNode = map.get(params.id);
        break;
      }
    }

    if (!parentNode || !parentNode.is_directory) throw new Error('Directory not found');

    const ig = await loadIgnorePatterns(rootPath);
    const scanner = new OptimizedScanner(rootPath, config, ig);
    const children = await scanner.scan(parentNode.path, parentNode.id);

    const map = nodeState.get(rootPath);
    if (map) {
      children.forEach((c) => {
        map.set(c.id, c);
      });
    }

    children.sort((a, b) => {
      if (a.is_directory !== b.is_directory) return a.is_directory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return children;
  });

  // --- READ FILE ---
  rpc.handle('repo2txt:read-file', async (payload: unknown) => {
    const params = payload as ReadFileParams;
    let targetNode: FileNode | undefined;

    for (const map of nodeState.values()) {
      if (map.has(params.id)) {
        targetNode = map.get(params.id);
        break;
      }
    }

    if (!targetNode || targetNode.is_directory) throw new Error('File not found');

    const MAX_PREVIEW = 100 * 1024; // 100KB limit

    if ((targetNode.size || 0) > MAX_PREVIEW) {
      const handle = await fs.open(targetNode.path, 'r');
      const buffer = Buffer.alloc(MAX_PREVIEW);
      const { bytesRead } = await handle.read(buffer, 0, MAX_PREVIEW, 0);
      await handle.close();

      if (isBinaryFile(buffer)) {
        return `--- BINARY FILE (${formatFileSize(targetNode.size || 0)}) ---`;
      }

      return (
        buffer.toString('utf-8', 0, bytesRead) +
        `\n\n--- TRUNCATED (${formatFileSize(targetNode.size || 0)}) ---`
      );
    }

    const buffer = await fs.readFile(targetNode.path);
    if (isBinaryFile(buffer)) {
      return `--- BINARY FILE (${formatFileSize(buffer.length)}) ---`;
    }

    return buffer.toString('utf-8');
  });

  // --- GET STATS ---
  rpc.handle('repo2txt:get-stats', (payload: unknown) => {
    const params = payload as { rootPath?: string };
    const rootPath = params.rootPath || ctx.root;
    const nodes = nodeState.get(rootPath);

    if (!nodes) {
      return { files: 0, size: 0, tokens: 0 } as AppStats;
    }

    const stats: AppStats = {
      files: 0,
      size: 0,
      tokens: 0,
    };

    for (const node of nodes.values()) {
      if (!node.is_directory && node.selected) {
        // Check if parent is selected
        if (node.parent_id) {
          const parent = nodes.get(node.parent_id);
          if (parent && !parent.selected) {
            continue;
          }
        }

        stats.files++;
        if (node.size !== null) {
          stats.size += node.size;
        }
        if (node.token_count !== null) {
          stats.tokens += node.token_count;
        }
      }
    }

    return stats;
  });

  // --- ACTIONS ---
  rpc.handle('repo2txt:update-selection', (p: any) => {
    for (const map of nodeState.values()) {
      const node = map.get(p.id);
      if (node) {
        node.selected = p.selected;
        if (node.is_directory) {
          const updateChildren = (pid: string) => {
            for (const child of map.values()) {
              if (child.parent_id === pid) {
                child.selected = p.selected;
                if (child.is_directory) updateChildren(child.id);
              }
            }
          };
          updateChildren(node.id);
        }
        return;
      }
    }
  });

  rpc.handle('repo2txt:toggle-expanded', (p: any) => {
    for (const map of nodeState.values()) {
      const node = map.get(p.id);
      if (node && node.is_directory) {
        node.expanded = p.expanded;
        return;
      }
    }
  });

  rpc.handle('repo2txt:search-nodes', (p: any) => {
    const q = p.query.toLowerCase();
    if (!q) return [];
    const res: string[] = [];
    for (const map of nodeState.values()) {
      for (const node of map.values()) {
        if (node.name.toLowerCase().includes(q)) res.push(node.id);
      }
    }
    return res;
  });

  // --- GENERATE MARKDOWN ---
  rpc.handle('repo2txt:generate-markdown', async (payload: unknown) => {
    const params = payload as GenerateMarkdownParams;
    const config = params.config || getDefaultConfig();

    let rootPath = '';
    let nodeMap: Map<string, FileNode> | undefined;

    for (const [rp, map] of nodeState.entries()) {
      rootPath = rp;
      nodeMap = map;
      break;
    }

    if (!nodeMap) throw new Error('No files loaded');

    const nodes = Array.from(nodeMap.values());
    
    // Use selection from client if provided, otherwise use server state
    let selectedFiles: FileNode[];
    if (params.selectedNodeIds && params.selectedNodeIds.length > 0) {
      // Update server state with client selection
      const selectedIdsSet = new Set(params.selectedNodeIds);
      for (const node of nodes) {
        if (!node.is_directory) {
          node.selected = selectedIdsSet.has(node.id);
        }
      }
      selectedFiles = nodes.filter((n) => !n.is_directory && n.selected);
    } else {
      // Fallback to server state
      selectedFiles = nodes.filter((n) => !n.is_directory && n.selected);
    }

    if (selectedFiles.length === 0) throw new Error('No files selected');

    rpc.broadcast('repo2txt:generation-progress', {
      current: 0,
      total: selectedFiles.length,
      stage: 'processing',
    });

    // Actual generation (reads file content) - no file output
    const result = await generateMarkdown(nodes, rootPath, config);

    lastGeneratedContent.set(rootPath, result.fullContent);

    // Return config data for client-side storage (api.storage)
    // Client will save it via api.storage instead of .r2x file
    const rootNodes = nodes.filter((n) => !n.parent_id);
    const configNodes = rootNodes.map((n) => fileNodeToConfigNode(n, nodeMap!));
    const r2xConfig: R2XConfig = {
      version: '1.0',
      rootPath: rootPath, // Include root path in config
      nodes: configNodes,
    };

    rpc.broadcast('repo2txt:generation-progress', {
      current: selectedFiles.length,
      total: selectedFiles.length,
      stage: 'completed',
    });

    return {
      preview_content: result.preview,
      is_truncated: result.isTruncated,
      stats: result.stats,
      config: r2xConfig, // Return config for client-side storage
    };
  });

  rpc.handle('repo2txt:copy-from-cache', (p: any) => {
    const c = lastGeneratedContent.get(p.rootPath || ctx.root);
    if (!c) throw new Error('No content generated yet');
    // No size limit - client will handle large content
    return { content: c };
  });
}
