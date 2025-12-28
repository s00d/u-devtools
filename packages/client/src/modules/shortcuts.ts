import { onUnmounted } from 'vue';
import type { ShortcutApi } from '@u-devtools/core';

const registry = new Map<string, () => void>();

// Парсинг события клавиатуры в строку комбинации
function parseEventToCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey) parts.push('meta');
  if (e.ctrlKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

// Глобальный обработчик клавиатуры
window.addEventListener(
  'keydown',
  (e) => {
    const combo = parseEventToCombo(e);
    if (registry.has(combo)) {
      e.preventDefault();
      e.stopPropagation();
      registry.get(combo)?.();
    }
  },
  true // capture phase для перехвата до других обработчиков
);

/**
 * Создает API для регистрации горячих клавиш.
 */
export function createShortcutApi(pluginName: string): ShortcutApi {
  return {
    register(keys: string[], action: () => void): () => void {
      const combo = keys
        .map((k) => k.toLowerCase())
        .join('+')
        .toLowerCase();

      // Проверка конфликтов
      if (registry.has(combo)) {
        console.warn(
          `[${pluginName}] Shortcut conflict: "${combo}" is already registered. Overwriting...`
        );
      }

      registry.set(combo, action);

      // Автоматическая очистка при размонтировании компонента плагина
      onUnmounted(() => {
        registry.delete(combo);
      });

      return () => {
        registry.delete(combo);
      };
    },
  };
}

