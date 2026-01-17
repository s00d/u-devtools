import { ref, reactive } from 'vue';
import type { AppBridge } from '@u-devtools/core';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue';
import { getOverlayHost, OVERLAY_ID } from '@u-devtools/overlay';
import type { LibraryProtocol } from '../../types';

// --- GLOBAL SINGLETON STATE ---
let isInitialized = false;

// Создаем глобальные ссылки, чтобы они были доступны во всех компонентах App
const selectedElement = ref<HTMLElement | null>(null);

// Placeholder ref (будет инициализирован при первом вызове useBridgeState)
let isInspectingRef = ref(false);

export function useBridgeState(bridge: AppBridge<LibraryProtocol>) {
  
  // Инициализация один раз
  if (!isInitialized) {
    // 1. Создаем синхронизированную переменную через bridge.state()
    isInspectingRef = useSyncedRef(bridge.state('isInspecting', false));

    // 2. Остальные слушатели
    bridge.on('element-selected', ({ html }) => {
      // Элемент уже выбран в selectElement, просто отправляем событие
    });

    window.addEventListener('message', (e) => {
      if (e.data === 'u-devtools:close' || e.data?.type === 'u-devtools:close') {
        resetState();
      }
    });
    
    isInitialized = true;
  }

  // --- HELPERS ---
  const isDevToolsElement = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    if (el.id === OVERLAY_ID.HOST || el.closest(`#${OVERLAY_ID.HOST}`)) return true;
    const root = el.getRootNode();
    if (root instanceof ShadowRoot && root.host?.id === OVERLAY_ID.HOST) return true;
    return false;
  };

  const findElementUnderCursor = (x: number, y: number): HTMLElement | null => {
    const host = getOverlayHost();
    const prevDisplay = host ? host.style.display : '';
    if (host) host.style.display = 'none';
    const el = document.elementFromPoint(x, y) as HTMLElement;
    if (host) host.style.display = prevDisplay;
    if (!el || isDevToolsElement(el)) return null;
    return el;
  };

  // --- ACTIONS ---
  const selectElement = (el: HTMLElement | null) => {
    if (!el || isDevToolsElement(el)) {
      if (!el) {
        selectedElement.value = null;
      }
      return;
    }

    selectedElement.value = el;
    
    // Отправляем HTML элемента в UI контекст
    bridge.send('element-selected', { html: el.outerHTML });
    
    // Выключаем инспектор после выбора
    if (isInspectingRef.value) {
      isInspectingRef.value = false;
    }
  };

  const resetState = () => {
    selectedElement.value = null;
    isInspectingRef.value = false;
  };

  return {
    selectedElement,
    // Возвращаем Ref, который можно читать и писать как обычную переменную
    isInspecting: isInspectingRef,
    selectElement,
    resetState,
    findElementUnderCursor,
  };
}

