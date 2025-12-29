import type { StorageDriver } from './types';

export class CacheStorageDriver implements StorageDriver {
  type = 'cache';
  name = 'Cache Storage';

  async fetchAll() {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    const result = [];

    for (const name of cacheNames) {
      try {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        
        // Лимитируем 50 записей для производительности
        const entries = await Promise.all(requests.slice(0, 50).map(async (req) => {
          // Мы не читаем тело сразу, это дорого. Читаем только метаданные.
          const resp = await cache.match(req);
          let size = 0;
          try {
            const blob = await resp?.clone().blob();
            size = blob?.size || 0;
          } catch {
            // Ignore size calculation errors
          }
          
          return {
            key: req.url,
            value: {
              status: resp?.status,
              type: resp?.headers.get('content-type') || 'unknown',
              size
            }
          };
        }));

        result.push({ name, entries });
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        result.push({ name, error });
      }
    }
    return result;
  }

  // Cache API обычно read-only для девтулзов, но удалять можно
  async save() {
    throw new Error('Editing Cache Storage entries directly is not supported yet.');
  }

  async remove(payload: { db: string; key: string }) {
    const { db: cacheName, key: url } = payload as { db: string; key: string };
    const cache = await caches.open(cacheName);
    await cache.delete(url);
  }

  async clear(payload: { db: string }) {
    const { db: cacheName } = payload as { db: string };
    await caches.delete(cacheName);
  }
}

