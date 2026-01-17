import type { StorageDriver } from './types';
import { openDB } from 'idb';
import {
  IndexedDBSavePayloadSchema,
  IndexedDBRemovePayloadSchema,
  IndexedDBClearPayloadSchema,
} from '../schemas';

export class IndexedDBDriver implements StorageDriver {
  type = 'indexeddb';
  name = 'IndexedDB';

  async fetchAll() {
    if (!('indexedDB' in window)) return [];

    const indexedDBWithDatabases = window.indexedDB as IDBFactory & {
      databases(): Promise<IDBDatabaseInfo[]>;
    };
    const dbsInfo = await indexedDBWithDatabases.databases();
    const result = [];

    for (const info of dbsInfo) {
      if (!info.name) continue;
      try {
        const db = await openDB(info.name, info.version);
        const stores = [];

        for (const storeName of db.objectStoreNames) {
          // Limit 50 records for performance
          const records = await db.getAll(storeName, undefined, 50);
          const keys = await db.getAllKeys(storeName, undefined, 50);

          stores.push({
            name: storeName,
            entries: keys.map((key, i) => ({ key, value: records[i] })),
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
    const validationResult = IndexedDBSavePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { db: dbName, store, key, value } = validationResult.data;
    const database = await openDB(dbName);
    // Use put for upsert (insert or update)
    await database.put(store, value, key as IDBValidKey);
    database.close();
  }

  async remove(payload: { db: string; store: string; key: unknown }) {
    const validationResult = IndexedDBRemovePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { db: dbName, store, key } = validationResult.data;
    const database = await openDB(dbName);
    await database.delete(store, key as IDBValidKey);
    database.close();
  }

  async clear(payload: { db: string; store: string }) {
    const validationResult = IndexedDBClearPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { db: dbName, store } = validationResult.data;
    const database = await openDB(dbName);
    await database.clear(store);
    database.close();
  }
}
