import type { StorageDriver, StorageEntry } from './types';

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
          // Пытаемся автоматически распарсить JSON
          if (value) value = JSON.parse(value);
        } catch { /* ignore */ }
        data.push({ key, value });
      }
    }
    return data;
  }

  save(payload: { key: string; value: unknown }) {
    const { key, value } = payload as { key: string; value: unknown };
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    this.storage.setItem(key, strValue);
  }

  remove(payload: { key: string }) {
    const { key } = payload as { key: string };
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }
}

