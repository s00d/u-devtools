export interface StorageEntry {
  key: string | number;
  value: unknown;
  // Metadata for UI (e.g., size, cookie expiration date, etc.)
  meta?: Record<string, unknown>;
}

export interface StorageDriver {
  name: string;
  type: string; // 'local', 'session', 'cookie', 'indexeddb', 'cache', 'opfs'

  // Get all data
  fetchAll(): Promise<unknown> | unknown;

  // CRUD
  save(payload: unknown): Promise<void> | void;
  remove(payload: unknown): Promise<void> | void;
  clear(payload?: unknown): Promise<void> | void;
}
