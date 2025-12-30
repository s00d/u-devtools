import { useStorage, useWindowSize } from '@vueuse/core';
import { computed, onMounted, onUnmounted } from 'vue';
import { devtools } from '@u-devtools/core';

const STATE_KEY = 'u-devtools-state';
const MIN_HEIGHT = 150;
const MAX_HEIGHT_RATIO = 0.9;

export function useDevToolsState() {
  const { height: windowHeight } = useWindowSize();
  
  const state = useStorage(STATE_KEY, {
    isOpen: false,
    height: 400
  });

  const clampHeight = (h: number) => {
    const max = Math.floor(windowHeight.value * MAX_HEIGHT_RATIO);
    return Math.max(MIN_HEIGHT, Math.min(max, h));
  };

  const currentHeight = computed({
    get: () => clampHeight(state.value.height),
    set: (v) => {
      state.value.height = clampHeight(v);
    }
  });

  const toggle = () => {
    state.value.isOpen = !state.value.isOpen;
  };

  const close = () => {
    state.value.isOpen = false;
  };

  const open = () => {
    state.value.isOpen = true;
  };

  // Синхронизация с внешними командами через BroadcastChannel
  let unsubscribe: (() => void) | null = null;
  let controlChannel: BroadcastChannel | null = null;

  onMounted(() => {
    // Слушаем изменения состояния от DevToolsControl
    unsubscribe = devtools.onStateChange((val) => {
      // Обновляем локальный стейт, чтобы анимация кнопки сработала
      state.value.isOpen = val;
    });

    // Обрабатываем команды open/close/toggle и отправляем state-changed
    controlChannel = new BroadcastChannel('u-devtools:control');
    controlChannel.addEventListener('message', (e) => {
      const { action, type } = e.data || {};
      
      // Игнорируем сообщения state-changed, чтобы избежать циклов
      if (type === 'u-devtools:state-changed' || type === 'u-devtools:state-response') {
        return;
      }
      
      if (!controlChannel) return;
      
      if (action === 'open') {
        const wasOpen = state.value.isOpen;
        state.value.isOpen = true;
        // Отправляем уведомление об изменении состояния только если оно изменилось
        if (!wasOpen) {
          controlChannel.postMessage({ type: 'u-devtools:state-changed', isOpen: true });
        }
      } else if (action === 'close') {
        const wasOpen = state.value.isOpen;
        state.value.isOpen = false;
        // Отправляем уведомление об изменении состояния только если оно изменилось
        if (wasOpen) {
          controlChannel.postMessage({ type: 'u-devtools:state-changed', isOpen: false });
        }
      } else if (action === 'toggle') {
        const wasOpen = state.value.isOpen;
        state.value.isOpen = !state.value.isOpen;
        // Отправляем уведомление об изменении состояния только если оно изменилось
        if (wasOpen !== state.value.isOpen) {
          controlChannel.postMessage({ type: 'u-devtools:state-changed', isOpen: state.value.isOpen });
        }
      } else if (action === 'get-state') {
        // Отвечаем на запрос состояния
        controlChannel.postMessage({ type: 'u-devtools:state-response', isOpen: state.value.isOpen });
      }
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (controlChannel) {
      controlChannel.close();
    }
  });

  return {
    isOpen: computed(() => state.value.isOpen),
    height: currentHeight,
    toggle,
    close,
    open
  };
}

