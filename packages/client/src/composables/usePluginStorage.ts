import type { StorageApi } from '@u-devtools/core';
import { reactive, watch } from 'vue';
import { safeJsonParse, safeJsonStringify } from '@u-devtools/utils';

const storageState = reactive<Record<string, unknown>>({});

const raw = localStorage.getItem('u-devtools-storage');
if (raw) {
  const parsed = safeJsonParse<Record<string, unknown>>(raw, {});
  if (parsed) {
    Object.assign(storageState, parsed);
  }
}

// Также читаем настройки из useSettings
const settingsRaw = localStorage.getItem('u-devtools-settings');
if (settingsRaw) {
  const settings = safeJsonParse<Record<string, unknown>>(settingsRaw, {});
  if (settings) {
    // Копируем настройки в storageState с правильным префиксом
    for (const key in settings) {
      if (key.includes(':')) {
        storageState[key] = settings[key];
      }
    }
  }
}

watch(
  storageState,
  () => {
    localStorage.setItem('u-devtools-storage', safeJsonStringify(storageState));
  },
  { deep: true }
);

export function createPluginStorage(pluginName: string): StorageApi {
  const prefix = `${pluginName}:`;

  return {
    get<T>(key: string, def: T): T {
      // Сначала проверяем storage
      let val = storageState[prefix + key];
      // Если не найдено, проверяем настройки (settings используют формат plugin:key)
      if (val === undefined) {
        const settingsRaw = localStorage.getItem('u-devtools-settings');
        if (settingsRaw) {
          const settings = safeJsonParse<Record<string, unknown>>(settingsRaw, {});
          if (settings) {
            val = settings[prefix + key];
          }
        }
      }
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
