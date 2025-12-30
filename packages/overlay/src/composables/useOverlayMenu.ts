import { ref, onMounted, onUnmounted } from 'vue';
import { OVERLAY_EVENT, type OverlayMenuItem } from '@u-devtools/core';

declare global {
  interface Window {
    __UDEVTOOLS_MENU_ITEMS__?: OverlayMenuItem[];
  }
}

export function useOverlayMenu() {
  const items = ref<OverlayMenuItem[]>([]);

  const handleRegister = (e: Event) => {
    const detail = (e as CustomEvent<OverlayMenuItem>).detail;
    
    // Избегаем дубликатов
    const existingIdx = items.value.findIndex(i => i.id === detail.id);
    if (existingIdx !== -1) {
      items.value[existingIdx] = detail;
    } else {
      items.value.push(detail);
    }

    // Сортировка
    items.value.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  onMounted(() => {
    // Проверяем глобальный массив зарегистрированных элементов (на случай, если они были зарегистрированы до монтирования overlay)
    if (window.__UDEVTOOLS_MENU_ITEMS__ && window.__UDEVTOOLS_MENU_ITEMS__.length > 0) {
      // Добавляем все элементы из глобального массива
      window.__UDEVTOOLS_MENU_ITEMS__.forEach(item => {
        const existingIdx = items.value.findIndex(i => i.id === item.id);
        if (existingIdx !== -1) {
          items.value[existingIdx] = item;
        } else {
          items.value.push(item);
        }
      });
      
      // Сортируем
      items.value.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Очищаем глобальный массив после обработки
      window.__UDEVTOOLS_MENU_ITEMS__ = [];
    }
    
    // Устанавливаем слушатель для новых регистраций
    window.addEventListener(OVERLAY_EVENT, handleRegister);
  });

  onUnmounted(() => {
    window.removeEventListener(OVERLAY_EVENT, handleRegister);
  });

  return {
    items
  };
}

