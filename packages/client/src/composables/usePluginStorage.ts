import type { StorageApi } from '@u-devtools/core';
import { reactive, watch } from 'vue';

const storageState = reactive<Record<string, unknown>>({});

try {
  const raw = localStorage.getItem('u-devtools-storage');
  if (raw) {
    Object.assign(storageState, JSON.parse(raw));
  }
} catch {
  // Ignore
}

watch(
  storageState,
  () => {
    localStorage.setItem('u-devtools-storage', JSON.stringify(storageState));
  },
  { deep: true }
);

export function createPluginStorage(pluginName: string): StorageApi {
  const prefix = `${pluginName}:`;

  return {
      get<T>(key: string, def: T): T {
        const val = storageState[prefix + key];
        return val === undefined ? def : (val as T);
      },
    set<T>(key: string, value: T) {
      storageState[prefix + key] = value;
    },
    remove(key: string) {
      delete storageState[prefix + key];
    },
  };
}
