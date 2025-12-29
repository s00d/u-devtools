import type { StorageDriver } from './types';
import { openDB } from 'idb';

export class IndexedDBDriver implements StorageDriver {
  type = 'indexeddb';
  name = 'IndexedDB';

  async fetchAll() {
    if (!('indexedDB' in window)) return [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbsInfo = await (window.indexedDB as any).databases();
    const result = [];

    for (const info of dbsInfo) {
      if (!info.name) continue;
      try {
        const db = await openDB(info.name, info.version);
        const stores = [];

        for (const storeName of db.objectStoreNames) {
          // Лимитируем 50 записей для производительности
          const records = await db.getAll(storeName, undefined, 50);
          const keys = await db.getAllKeys(storeName, undefined, 50);
          
          stores.push({
            name: storeName,
            entries: keys.map((key, i) => ({ key, value: records[i] }))
          });
        }
        
        result.push({ name: info.name, version: info.version, stores });
        db.close();
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        result.push({ name: info.name, error });
      }
    }
    return result;
  }

  async save(payload: { db: string; store: string; key: unknown; value: unknown }) {
    const { db: dbName, store, key, value } = payload as { db: string; store: string; key: unknown; value: unknown };
    const database = await openDB(dbName);
    // Используем put для upsert (вставка или обновление)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await database.put(store, value as any, key as any);
    database.close();
  }

  async remove(payload: { db: string; store: string; key: unknown }) {
    const { db: dbName, store, key } = payload as { db: string; store: string; key: unknown };
    const database = await openDB(dbName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await database.delete(store, key as any);
    database.close();
  }

  async clear(payload: { db: string; store: string }) {
    const { db: dbName, store } = payload as { db: string; store: string };
    const database = await openDB(dbName);
    await database.clear(store);
    database.close();
  }
}

