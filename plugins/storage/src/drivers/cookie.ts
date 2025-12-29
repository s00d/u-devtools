import type { StorageDriver, StorageEntry } from './types';

export class CookieDriver implements StorageDriver {
  type = 'cookie';
  name = 'Cookies';

  fetchAll(): StorageEntry[] {
    if (!document.cookie) return [];
    return document.cookie.split(';').filter(Boolean).map(c => {
      const [key, ...v] = c.split('=');
      return { 
        key: key.trim(), 
        value: decodeURIComponent(v.join('=')) 
      };
    });
  }

  save(payload: { key: string; value: string }) {
    const { key, value } = payload as { key: string; value: string };
    // Простая установка. Для продвинутой нужны expires, domain и т.д.
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
  }

  remove(payload: { key: string }) {
    const { key } = payload as { key: string };
    document.cookie = `${key}=; Max-Age=0; path=/`;
  }

  clear() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name.trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
  }
}

