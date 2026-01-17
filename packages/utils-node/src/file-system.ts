import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Dirent } from 'node:fs';
import { safeResolve } from './path';

/**
 * File system service for safe file operations within a project root.
 * 
 * @example
 * ```typescript
 * import { FileSystemService } from '@u-devtools/utils-node';
 * 
 * const fs = new FileSystemService('/path/to/project');
 * 
 * // Read file
 * const content = await fs.read('path/to/file.txt');
 * 
 * // Read JSON
 * const data = await fs.readJson('path/to/data.json');
 * 
 * // Write file
 * await fs.write('path/to/file.txt', content);
 * 
 * // Write JSON
 * await fs.writeJson('path/to/data.json', data, 2); // 2 = indentation
 * 
 * // Read directory
 * const entries = await fs.readdir('path/to/dir', { withFileTypes: true });
 * 
 * // Create directory
 * await fs.mkdir('path/to/dir', true); // true = recursive
 * ```
 */
export class FileSystemService {
  constructor(private root: string) {}

  /**
   * Безопасное чтение файла. Выбрасывает ошибку, если путь выходит за пределы root.
   * 
   * @example
   * ```typescript
   * const content = await fs.read('path/to/file.txt');
   * ```
   */
  async read(filePath: string): Promise<string> {
    const safePath = safeResolve(this.root, filePath);
    return await fs.readFile(safePath, 'utf-8');
  }

  /**
   * Безопасное чтение JSON.
   * 
   * @example
   * ```typescript
   * const data = await fs.readJson('path/to/data.json');
   * ```
   */
  async readJson<T = unknown>(filePath: string): Promise<T | null> {
    try {
      const content = await this.read(filePath);
      return JSON.parse(content) as T;
    } catch (e) {
      return null;
    }
  }

  /**
   * Безопасная запись файла. Автоматически создает директории.
   * 
   * @example
   * ```typescript
   * await fs.write('path/to/file.txt', content);
   * ```
   */
  async write(filePath: string, content: string): Promise<void> {
    const safePath = safeResolve(this.root, filePath);
    const dir = path.dirname(safePath);
    
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    await fs.writeFile(safePath, content, 'utf-8');
  }

  /**
   * Безопасная запись JSON файла. Автоматически создает директории.
   * 
   * @example
   * ```typescript
   * await fs.writeJson('path/to/data.json', data, 2); // 2 = indentation
   * ```
   */
  async writeJson(filePath: string, data: unknown, indent = 2): Promise<void> {
    const content = JSON.stringify(data, null, indent);
    await this.write(filePath, content);
  }

  /**
   * Проверка существования файла/директории.
   */
  exists(filePath: string): boolean {
    try {
      const safePath = safeResolve(this.root, filePath);
      return existsSync(safePath);
    } catch {
      return false;
    }
  }

  /**
   * Проверка доступа к файлу (аналог fs.access).
   * Выбрасывает ошибку, если файл недоступен.
   */
  async access(filePath: string): Promise<void> {
    const safePath = safeResolve(this.root, filePath);
    return await fs.access(safePath);
  }

  /**
   * Создание директории (рекурсивно).
   * 
   * @example
   * ```typescript
   * await fs.mkdir('path/to/dir', true); // true = recursive
   * ```
   */
  async mkdir(dirPath: string, recursive = true): Promise<void> {
    const safePath = safeResolve(this.root, dirPath);
    await fs.mkdir(safePath, { recursive });
  }

  /**
   * Чтение директории.
   * 
   * @example
   * ```typescript
   * const entries = await fs.readdir('path/to/dir', { withFileTypes: true });
   * ```
   */
  async readdir(dirPath: string, options?: { withFileTypes?: boolean }): Promise<string[] | Dirent[]> {
    const safePath = safeResolve(this.root, dirPath);
    if (options?.withFileTypes) {
      return await fs.readdir(safePath, { withFileTypes: true });
    }
    return await fs.readdir(safePath) as string[];
  }

  /**
   * Удаление файла или директории.
   */
  async remove(filePath: string): Promise<void> {
    const safePath = safeResolve(this.root, filePath);
    const stat = await fs.stat(safePath);
    
    if (stat.isDirectory()) {
      await fs.rmdir(safePath, { recursive: true });
    } else {
      await fs.unlink(safePath);
    }
  }

  /**
   * Получение информации о файле/директории.
   */
  async stat(filePath: string) {
    const safePath = safeResolve(this.root, filePath);
    return await fs.stat(safePath);
  }
}
