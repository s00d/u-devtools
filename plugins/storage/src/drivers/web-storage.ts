import type { StorageDriver, StorageEntry } from './types';
import { StorageSavePayloadSchema, StorageRemovePayloadSchema } from '../schemas';

export class WebStorageDriver implements StorageDriver {
  private storage: Storage;

  constructor(public type: 'local' | 'session') {
    this.storage = type === 'local' ? window.localStorage : window.sessionStorage;
  }

  get name() {
    return this.type === 'local' ? 'Local Storage' : 'Session Storage';
  }

  fetchAll(): StorageEntry[] {
    const data: StorageEntry[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        let value = this.storage.getItem(key);
        try {
          // Try to automatically parse JSON
          if (value) value = JSON.parse(value);
        } catch {
          /* ignore */
        }
        data.push({ key, value });
      }
    }
    return data;
  }

  save(payload: { key: string; value: unknown }) {
    const validationResult = StorageSavePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { key, value } = validationResult.data;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    this.storage.setItem(key, strValue);
  }

  remove(payload: { key: string }) {
    const validationResult = StorageRemovePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { key } = validationResult.data;
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }
}
