import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { StorageDriver } from './drivers/types';
import type { StorageProtocol } from './types';
import { WebStorageDriver } from './drivers/web-storage';
import { CookieDriver } from './drivers/cookie';
import { IndexedDBDriver } from './drivers/indexeddb';
import { CacheStorageDriver } from './drivers/cache';
import { OPFSDriver } from './drivers/opfs';
import { openDB } from 'idb';


// Driver registry
const drivers: Record<string, StorageDriver> = {
  local: new WebStorageDriver('local'),
  session: new WebStorageDriver('session'),
  cookie: new CookieDriver(),
  indexeddb: new IndexedDBDriver(),
  cache: new CacheStorageDriver(),
  opfs: new OPFSDriver(),
};

// --- Safe Local/Session Storage retrieval ---
const getStorage = (type: 'local' | 'session') => {
  try {
    const store = type === 'local' ? localStorage : sessionStorage;
    const data = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key) {
        let value = store.getItem(key);
        try {
          // Try to parse, but keep original if not JSON
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

// --- Safe Cookie retrieval (client-side) ---
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

// --- Get HttpOnly Cookies from server ---
const getServerCookies = async () => {
  try {
    const res = await fetch('/__u-devtools/cookies');
    if (!res.ok) return [];
    const cookies = await res.json();
    return cookies; // Expect array { key, value, httpOnly: true }
  } catch {
    // Silent error - if server unavailable, just don't show HttpOnly cookies
    return [];
  }
};

// --- Safe IndexedDB retrieval ---
const getIDB = async () => {
  // Check support. databases() method only exists in Chrome/Edge!
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
            // Read only keys or limit data to avoid crashing on Blob
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

// Main refresh function
const refreshAll = async (bridge?: AppBridge<StorageProtocol>) => {
  try {
    // Parallel loading of async data
    const [idb, serverCookies] = await Promise.all([getIDB(), getServerCookies()]);

    // Synchronous data
    const local = getStorage('local');
    const session = getStorage('session');
    const clientCookies = getClientCookies();

    // Merge cookies (Client + Server). Server ones are more accurate, but client ones update instantly
    const cookieMap = new Map<string, { key: string; value: string; httpOnly: boolean }>();
    for (const c of clientCookies) {
      cookieMap.set(c.key, c);
    }

    // If server returned cookies, update/add them
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

    // Get other data via drivers (cache, opfs)
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

    const result = {
      local,
      session,
      cookie: Array.from(cookieMap.values()),
      indexeddb: idb,
      cache,
      opfs,
    };

    if (bridge) {
      bridge.send('data', result);
    }
  } catch (e) {
    console.error('[U-DevTools] Storage refresh failed:', e);
    if (bridge) {
      bridge.send('data', {
        local: [],
        session: [],
        cookie: [],
        indexeddb: [],
        cache: [],
        opfs: [],
      });
    }
  }
};

// Handle commands from UI
const handleAction = async (action: 'save' | 'remove' | 'clear', payload: unknown, bridge?: AppBridge<StorageProtocol>) => {
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

    // After change immediately update data
    await refreshAll(bridge);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`[Storage] Action ${action} failed:`, e);
    if (bridge) {
      bridge.send('error', error);
    }
  }
};

export default defineApp({
  component: undefined,
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<StorageProtocol>;
    setupDevTools({ bridge: typedBridge });
    
    // Initial refresh
    refreshAll(typedBridge);
    
    // Subscriptions
    typedBridge.on('refresh', () => refreshAll(typedBridge));
    typedBridge.on('save', (p) => handleAction('save', p, typedBridge));
    typedBridge.on('delete', (p) => handleAction('remove', p, typedBridge));
    typedBridge.on('clear', (p) => handleAction('clear', p, typedBridge));

    // Auto-refresh triggers
    const storageHandler = () => refreshAll(typedBridge);
    window.addEventListener('storage', storageHandler);

    // --- CLEANUP ---
    onCleanup(() => {
      window.removeEventListener('storage', storageHandler);
    });
  },
});
