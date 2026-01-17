import { z } from 'zod';

/**
 * Zod schema for storage driver save payload (cookie, web-storage)
 */
export const StorageSavePayloadSchema = z.object({
  key: z.string().min(1, 'key is required'),
  value: z.unknown(),
});

/**
 * Zod schema for storage driver remove payload
 */
export const StorageRemovePayloadSchema = z.object({
  key: z.string().min(1, 'key is required'),
});

/**
 * Zod schema for IndexedDB save payload
 */
export const IndexedDBSavePayloadSchema = z.object({
  db: z.string().min(1, 'db is required'),
  store: z.string().min(1, 'store is required'),
  key: z.unknown(),
  value: z.unknown(),
});

/**
 * Zod schema for IndexedDB remove payload
 */
export const IndexedDBRemovePayloadSchema = z.object({
  db: z.string().min(1, 'db is required'),
  store: z.string().min(1, 'store is required'),
  key: z.unknown(),
});

/**
 * Zod schema for IndexedDB clear payload
 */
export const IndexedDBClearPayloadSchema = z.object({
  db: z.string().min(1, 'db is required'),
  store: z.string().min(1, 'store is required'),
});

/**
 * Zod schema for Cache save payload
 */
export const CacheSavePayloadSchema = z.object({
  db: z.string().min(1, 'db is required'),
  key: z.string().min(1, 'key is required'),
});

/**
 * Zod schema for Cache clear payload
 */
export const CacheClearPayloadSchema = z.object({
  db: z.string().min(1, 'db is required'),
});

/**
 * Zod schema for OPFS remove payload
 */
export const OPFSRemovePayloadSchema = z.object({
  key: z.string().min(1, 'key is required'),
});
