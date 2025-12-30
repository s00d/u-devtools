import { AppBridge } from '@u-devtools/core';
import type { StorageDriver } from './drivers/types';
import { WebStorageDriver } from './drivers/web-storage';
import { CookieDriver } from './drivers/cookie';
import { IndexedDBDriver } from './drivers/indexeddb';
import { CacheStorageDriver } from './drivers/cache';
import { OPFSDriver } from './drivers/opfs';
import { openDB } from 'idb';

const bridge = new AppBridge('storage');

// Реестр драйверов
const drivers: Record<string, StorageDriver> = {
  local: new WebStorageDriver('local'),
  session: new WebStorageDriver('session'),
  cookie: new CookieDriver(),
  indexeddb: new IndexedDBDriver(),
  cache: new CacheStorageDriver(),
  opfs: new OPFSDriver(),
};

// --- Безопасное получение Local/Session Storage ---
const getStorage = (type: 'local' | 'session') => {
  try {
    const store = type === 'local' ? localStorage : sessionStorage;
    const data = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key) {
        let value = store.getItem(key);
        try {
          // Пытаемся распарсить, но сохраняем оригинал если это не JSON
          if (value) {
            const parsed = JSON.parse(value);
            value = parsed;
          }
        } catch {
          /* not json */
        }
        data.push({ key, value });
      }
    }
    return data;
  } catch {
    return [];
  }
};

// --- Безопасное получение Cookies (клиентские) ---
const getClientCookies = () => {
  try {
    if (!document.cookie) return [];
    return document.cookie
      .split(';')
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split('=');
        return {
          key: key?.trim() || '',
          value: decodeURIComponent(v.join('=')),
          httpOnly: false,
        };
      })
      .filter((c) => c.key);
  } catch {
    return [];
  }
};

// --- Получение HttpOnly Cookies с сервера ---
const getServerCookies = async () => {
  try {
    const res = await fetch('/__u-devtools/cookies');
    if (!res.ok) return [];
    const cookies = await res.json();
    return cookies; // Ожидаем массив { key, value, httpOnly: true }
  } catch {
    // Тихая ошибка - если сервер недоступен, просто не показываем HttpOnly куки
    return [];
  }
};

// --- Безопасное получение IndexedDB ---
const getIDB = async () => {
  // Проверка поддержки. Метод databases() есть только в Chrome/Edge!
  if (
    !('indexedDB' in window) ||
    typeof (window.indexedDB as { databases?: () => Promise<IDBDatabaseInfo[]> }).databases !==
      'function'
  ) {
    return [];
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbs = await (window.indexedDB as any).databases();
    const result = [];

    for (const dbInfo of dbs) {
      if (!dbInfo.name) continue;

      try {
        const db = await openDB(dbInfo.name, dbInfo.version);
        const stores = [];

        for (const storeName of db.objectStoreNames) {
          try {
            // Читаем только ключи или лимит данных, чтобы не упасть на Blob
            const records = await db.getAll(storeName, undefined, 50);
            const keys = await db.getAllKeys(storeName, undefined, 50);

            const entries = keys.map((key, i) => ({
              key,
              value: records[i],
            }));
            stores.push({ name: storeName, entries });
          } catch {
            stores.push({ name: storeName, entries: [], error: 'Read Error' });
          }
        }

        result.push({ name: dbInfo.name, version: dbInfo.version, stores });
        db.close();
      } catch {
        result.push({ name: dbInfo.name, error: 'Locked or Access Denied' });
      }
    }
    return result;
  } catch {
    return [];
  }
};

// Главная функция обновления
const refreshAll = async () => {
  try {
    // Параллельная загрузка асинхронных данных
    const [idb, serverCookies] = await Promise.all([getIDB(), getServerCookies()]);

    // Синхронные данные
    const local = getStorage('local');
    const session = getStorage('session');
    const clientCookies = getClientCookies();

    // Мержим куки (Client + Server). Серверные точнее, но клиентские обновляются мгновенно
    const cookieMap = new Map<string, { key: string; value: string; httpOnly: boolean }>();
    for (const c of clientCookies) {
      cookieMap.set(c.key, c);
    }

    // Если сервер вернул куки, обновляем/добавляем их
    if (Array.isArray(serverCookies)) {
      for (const c of serverCookies) {
        const cookie = c as { key: string; value: string; httpOnly?: boolean };
        cookieMap.set(cookie.key, {
          key: cookie.key,
          value: cookie.value,
          httpOnly: cookie.httpOnly ?? true,
        });
      }
    }

    // Получаем остальные данные через драйверы (cache, opfs)
    const cache = await (async () => {
      try {
        const data = drivers.cache.fetchAll();
        return data instanceof Promise ? await data : data;
      } catch {
        return [];
      }
    })();

    const opfs = await (async () => {
      try {
        const data = drivers.opfs.fetchAll();
        return data instanceof Promise ? await data : data;
      } catch {
        return [];
      }
    })();

    const result: Record<string, unknown> = {
      local,
      session,
      cookie: Array.from(cookieMap.values()),
      indexeddb: idb,
      cache,
      opfs,
    };

    bridge.send('data', result);
  } catch (e) {
    console.error('[U-DevTools] Storage refresh failed:', e);
    // Отправляем пустые данные, чтобы UI не завис
    bridge.send('data', {
      local: [],
      session: [],
      cookie: [],
      indexeddb: [],
      cache: [],
      opfs: [],
    });
  }
};

// Обработка команд от UI
const handleAction = async (action: 'save' | 'remove' | 'clear', payload: unknown) => {
  const p = payload as { type: string };
  const driver = drivers[p.type] as StorageDriver | undefined;
  if (!driver) return;

  try {
    if (action === 'save') {
      const result = driver.save(payload);
      if (result instanceof Promise) await result;
    }
    if (action === 'remove') {
      const result = driver.remove(payload);
      if (result instanceof Promise) await result;
    }
    if (action === 'clear') {
      const result = driver.clear(payload);
      if (result instanceof Promise) await result;
    }

    // После изменения сразу обновляем данные
    refreshAll();
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`[Storage] Action ${action} failed:`, e);
    bridge.send('error', error);
  }
};

// Подписки
bridge.on('refresh', refreshAll);
bridge.on('save', (p) => handleAction('save', p));
bridge.on('delete', (p) => handleAction('remove', p));
bridge.on('clear', (p) => handleAction('clear', p));

// Auto-refresh triggers
window.addEventListener('storage', refreshAll);
const intervalId = setInterval(refreshAll, 3000); // Poll for cookies/IDB

// Задержка для того, чтобы UI успел подписаться
setTimeout(() => {
  refreshAll();
}, 500);

// --- CLEANUP (ВАЖНО!) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hot = (import.meta as any).hot;
if (hot) {
  hot.dispose(() => {
    window.removeEventListener('storage', refreshAll);
    clearInterval(intervalId);
    bridge.close();
  });
}
