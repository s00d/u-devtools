export interface StorageEntry {
  key: string | number;
  value: unknown;
  // Метаданные для UI (например, размер, дата истечения куки и т.д.)
  meta?: Record<string, unknown>; 
}

export interface StorageDriver {
  name: string;
  type: string; // 'local', 'session', 'cookie', 'indexeddb', 'cache', 'opfs'
  
  // Получить все данные
  fetchAll(): Promise<unknown> | unknown;
  
  // CRUD
  save(payload: unknown): Promise<void> | void;
  remove(payload: unknown): Promise<void> | void;
  clear(payload?: unknown): Promise<void> | void;
}

