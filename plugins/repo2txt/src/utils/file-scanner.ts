import ignore from 'ignore';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { FileNode, AppConfig } from '../types';

/**
 * Get language by file extension
 */
export function getLanguageByExtension(filePath: string): string {
  const fileName = path.basename(filePath);
  
  // Special files
  const specialFiles: Record<string, string> = {
    'Dockerfile': 'dockerfile',
    'Makefile': 'makefile',
    'LICENSE': 'text',
    'README': 'markdown',
    'CHANGELOG': 'markdown',
    '.gitignore': 'gitignore',
    '.gitattributes': 'gitattributes',
    '.env': 'dotenv',
    '.env.example': 'dotenv',
  };
  
  if (specialFiles[fileName]) {
    return specialFiles[fileName];
  }
  
  if (fileName === 'docker-compose.yml' || fileName === 'docker-compose.yaml') {
    return 'yaml';
  }
  
  // By extension
  const ext = path.extname(filePath).slice(1).toLowerCase();
  
  const extensionMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'json': 'json',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'hpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'rs': 'rust',
    'go': 'go',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'sql': 'sql',
    'vue': 'vue',
    'svelte': 'svelte',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'conf',
    'config': 'conf',
  };
  
  return extensionMap[ext] || 'text';
}

/**
 * Check if file should be ignored based on config
 * Оптимизировано: сначала проверяем быстрые условия (config), потом медленные (gitignore)
 */
export function shouldIgnoreFile(
  relativePath: string, // Путь относительно корня (src/index.ts)
  fileName: string,     // Имя файла (index.ts)
  isDirectory: boolean,
  config: AppConfig,
  ig: ReturnType<typeof ignore>
): boolean {
  // 1. Config based ignores (FASTEST)
  if (config.ignored_names.includes(fileName)) return true;
  if (isDirectory && config.ignored_folders.includes(fileName)) return true;
  if (!isDirectory) {
    const ext = path.extname(fileName).slice(1).toLowerCase();
    if (config.binary_extensions.includes(ext)) return true;
  }

  // 2. Gitignore check (SLOWER)
  // Важно передавать relativePath
  return ig.ignores(relativePath);
}

/**
 * Load ignore patterns from .gitignore and .r2x_ignore
 */
export async function loadIgnorePatterns(rootPath: string): Promise<ReturnType<typeof ignore>> {
  const ig = ignore();
  
  // Load .gitignore
  const gitignorePath = path.join(rootPath, '.gitignore');
  if (existsSync(gitignorePath)) {
    try {
      const content = await fs.readFile(gitignorePath, 'utf-8');
      ig.add(content);
    } catch (error) {
      console.warn('[repo2txt] Failed to read .gitignore:', error);
    }
  }
  
  // Load .r2x_ignore
  const r2xIgnorePath = path.join(rootPath, '.r2x_ignore');
  if (existsSync(r2xIgnorePath)) {
    try {
      const content = await fs.readFile(r2xIgnorePath, 'utf-8');
      ig.add(content);
    } catch (error) {
      console.warn('[repo2txt] Failed to read .r2x_ignore:', error);
    }
  }
  
  return ig;
}

/**
 * Generate unique ID for file node
 */
export function generateNodeId(relativePath: string): string {
  // Use relative path as ID (normalized)
  return relativePath.replace(/\\/g, '/');
}
