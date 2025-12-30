import { ref, onMounted, onUnmounted } from 'vue';
import { OVERLAY_EVENT, type OverlayMenuItem } from '@u-devtools/core';

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
    window.addEventListener(OVERLAY_EVENT, handleRegister);
  });

  onUnmounted(() => {
    window.removeEventListener(OVERLAY_EVENT, handleRegister);
  });

  return {
    items
  };
}

