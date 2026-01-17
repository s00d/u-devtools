import Cookies from 'universal-cookie';
import type { StorageDriver, StorageEntry } from './types';
import { StorageSavePayloadSchema, StorageRemovePayloadSchema } from '../schemas';

export class CookieDriver implements StorageDriver {
  type = 'cookie';
  name = 'Cookies';
  private cookies = new Cookies();

  fetchAll(): StorageEntry[] {
    const all = this.cookies.getAll();
    return Object.entries(all).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }

  save(payload: { key: string; value: string }) {
    const validationResult = StorageSavePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { key, value } = validationResult.data;
    this.cookies.set(key, String(value), { path: '/' });
  }

  remove(payload: { key: string }) {
    const validationResult = StorageRemovePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
    }
    const { key } = validationResult.data;
    this.cookies.remove(key, { path: '/' });
  }

  clear() {
    const all = this.cookies.getAll();
    Object.keys(all).forEach((key) => {
      this.cookies.remove(key, { path: '/' });
    });
  }
}
