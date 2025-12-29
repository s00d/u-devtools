import type { StorageDriver } from './types';

export class OPFSDriver implements StorageDriver {
  type = 'opfs';
  name = 'OPFS (Files)';

  async fetchAll() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(navigator.storage as any)?.getDirectory) return [];

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const root = await (navigator.storage as any).getDirectory();
      const entries = await this.scanDir(root, '');
      
      // OPFS - это одна большая "база", но для совместимости с UI вернем как массив
      return [{ 
        name: 'root', 
        entries 
      }];
    } catch (e) {
      return [];
    }
  }

  // Рекурсивный скан
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async scanDir(dirHandle: FileSystemDirectoryHandle, pathPrefix: string): Promise<any[]> {
    const entries = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const [name, handle] of (dirHandle as any).entries()) {
      const path = pathPrefix ? `${pathPrefix}/${name}` : name;
      
      if (handle.kind === 'file') {
        const file = await handle.getFile();
        entries.push({
          key: path,
          value: {
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toLocaleString()
          }
        });
      } else if (handle.kind === 'directory') {
        // Рекурсия
        const subEntries = await this.scanDir(handle, path);
        entries.push(...subEntries);
      }
    }
    return entries;
  }

  async save() {
    throw new Error('Editing files directly is not supported in this version.');
  }

  async remove(payload: { key: string }) {
    const { key } = payload as { key: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = await (navigator.storage as any).getDirectory();
    // Удаление файла по пути "folder/subfolder/file.txt"
    const parts = key.split('/');
    const fileName = parts.pop()!;
    
    let currentDir = root;
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part);
    }
    
    await currentDir.removeEntry(fileName);
  }

  async clear() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = await (navigator.storage as any).getDirectory();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const [name] of root.keys()) {
      await root.removeEntry(name, { recursive: true });
    }
  }
}

