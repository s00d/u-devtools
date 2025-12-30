import Cookies from 'universal-cookie';
import type { StorageDriver, StorageEntry } from './types';

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
    const { key, value } = payload as { key: string; value: string };
    this.cookies.set(key, value, { path: '/' });
  }

  remove(payload: { key: string }) {
    const { key } = payload as { key: string };
    this.cookies.remove(key, { path: '/' });
  }

  clear() {
    const all = this.cookies.getAll();
    Object.keys(all).forEach((key) => {
      this.cookies.remove(key, { path: '/' });
    });
  }
}

