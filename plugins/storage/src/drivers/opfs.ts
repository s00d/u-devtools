import type { StorageDriver, StorageEntry } from './types';
import { OPFSRemovePayloadSchema } from '../schemas';

export class OPFSDriver implements StorageDriver {
  type = 'opfs';
  name = 'OPFS (Files)';

  async fetchAll() {
    const storageManager = navigator.storage as StorageManager & {
      getDirectory?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!storageManager.getDirectory) return [];

    try {
      const root = await storageManager.getDirectory();
      const entries = await this.scanDir(root, '');

      // OPFS is one big "database", but for UI compatibility return as array
      return [
        {
          name: 'root',
          entries,
        },
      ];
    } catch (_e) {
      return [];
    }
  }

  // Recursive scan
  private async scanDir(
    dirHandle: FileSystemDirectoryHandle,
    pathPrefix: string
  ): Promise<StorageEntry[]> {
    const entries: StorageEntry[] = [];
    const dirWithEntries = dirHandle as FileSystemDirectoryHandle & {
      entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
    };
    for await (const [name, handle] of dirWithEntries.entries()) {
      const path = pathPrefix ? `${pathPrefix}/${name}` : name;

      if (handle.kind === 'file') {
        const fileHandle = handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        entries.push({
          key: path,
          value: {
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleString(),
          },
        });
      } else if (handle.kind === 'directory') {
        // Recursion
        const dirHandle = handle as FileSystemDirectoryHandle;
        const subEntries = await this.scanDir(dirHandle, path);
        entries.push(...subEntries);
      }
    }
    return entries;
  }

  async save() {
    throw new Error('Editing files directly is not supported in this version.');
  }

  async remove(payload: { key: string }) {
    const validationResult = OPFSRemovePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { key } = validationResult.data;
    const storageManager = navigator.storage as StorageManager & {
      getDirectory?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!storageManager.getDirectory) return;
    const root = await storageManager.getDirectory();
    // Delete file by path "folder/subfolder/file.txt"
    const parts = key.split('/');
    const fileName = parts.pop();
    if (!fileName) return;

    let currentDir = root;
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part);
    }

    await currentDir.removeEntry(fileName);
  }

  async clear() {
    const storageManager = navigator.storage as StorageManager & {
      getDirectory?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!storageManager.getDirectory) return;
    const root = await storageManager.getDirectory();
    const rootWithKeys = root as FileSystemDirectoryHandle & {
      keys: () => AsyncIterableIterator<string>;
    };
    for await (const name of rootWithKeys.keys()) {
      await root.removeEntry(name, { recursive: true });
    }
  }
}
