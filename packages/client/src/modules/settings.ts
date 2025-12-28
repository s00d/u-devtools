import { reactive, watch } from 'vue';
import type { PluginClientInstance, SettingsApi } from '@u-devtools/core';

// Глобальное состояние настроек
const globalState = reactive<Record<string, unknown>>({});
const STORAGE_KEY = 'u-devtools-global-settings';

// 1. Инициализация (Загрузка из LS)
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    Object.assign(globalState, JSON.parse(saved));
  }
} catch (e) {
  console.error('Failed to load settings', e);
}

// 2. Автосохранение при любом изменении
watch(
  globalState,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      // ignore quota errors
    }
  },
  { deep: true }
);

/**
 * Инициализирует дефолтные значения на основе схем плагинов.
 * Вызывается при старте приложения.
 */
export function initDefaultSettings(plugins: PluginClientInstance[]) {
  plugins.forEach((plugin) => {
    if (!plugin.settings) return;

    Object.entries(plugin.settings).forEach(([key, schema]) => {
      const fullKey = `${plugin.name}:${key}`;
      // Если значения нет в сторе, ставим дефолт
      if (globalState[fullKey] === undefined && schema.default !== undefined) {
        globalState[fullKey] = schema.default;
      }
    });
  });
}

/**
 * Создает API настроек, скоупированное (изолированное) для конкретного плагина.
 */
export function createSettingsApi(pluginName: string): SettingsApi {
  return {
    get<T>(key: string, defaultValue?: T): T {
      const fullKey = `${pluginName}:${key}`;
      // Доступ к reactive объекту через индексацию отслеживается Vue автоматически
      // при использовании внутри computed или template
      return (globalState[fullKey] !== undefined ? globalState[fullKey] : defaultValue) as T;
    },

    set(key: string, value: unknown) {
      const fullKey = `${pluginName}:${key}`;
      globalState[fullKey] = value;
    },

    // Геттер для получения всех настроек (нужен для UForm, чтобы видеть реактивные изменения)
    get all() {
      // Возвращаем срез глобального стейта, относящийся к этому плагина
      // В Vue 3 это будет работать реактивно, если использовать внутри computed/template
      // Важно: обращаемся к globalState напрямую, чтобы Vue отслеживал изменения
      const result: Record<string, unknown> = {};
      // Используем Object.keys для итерации, но обращаемся к globalState[k] для реактивности
      for (const k in globalState) {
        if (k.startsWith(`${pluginName}:`)) {
          const shortKey = k.replace(`${pluginName}:`, '');
          result[shortKey] = globalState[k]; // Это отслеживается Vue
        }
      }
      return result;
    },
  };
}

