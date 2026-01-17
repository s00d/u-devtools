import type { StorageDriver } from './types';
import { CacheSavePayloadSchema, CacheClearPayloadSchema } from '../schemas';

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

        // Limit 50 records for performance
        const entries = await Promise.all(
          requests.slice(0, 50).map(async (req) => {
            // We don't read body immediately, it's expensive. Read only metadata.
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
                size,
              },
            };
          })
        );

        result.push({ name, entries });
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        result.push({ name, error });
      }
    }
    return result;
  }

  // Cache API is usually read-only for devtools, but deletion is possible
  async save() {
    throw new Error('Editing Cache Storage entries directly is not supported yet.');
  }

  async remove(payload: { db: string; key: string }) {
    const validationResult = CacheSavePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { db: cacheName, key: url } = validationResult.data;
    const cache = await caches.open(cacheName);
    await cache.delete(url);
  }

  async clear(payload: { db: string }) {
    const validationResult = CacheClearPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { db: cacheName } = validationResult.data;
    await caches.delete(cacheName);
  }
}
