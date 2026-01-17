import { ref, reactive, watch } from 'vue';
import type { AppBridge } from '@u-devtools/core';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue'; // Адаптер для Vue
import { getOverlayHost, OVERLAY_ID } from '@u-devtools/overlay';
import { getElementSourceInfo } from '../locator';
import { scanElementStyles } from '../scanner';
import type { ElementState, TailwindProtocol } from '../../types';
import { disableTextEditing } from '../designer/text-editor';

// --- GLOBAL SINGLETON STATE ---
let isInitialized = false;

// Создаем глобальные ссылки, чтобы они были доступны во всех компонентах App
const selectedElement = ref<HTMLElement | null>(null);
const selectionInfo = reactive({ tagName: '', id: '', classes: [] as string[] });

// Placeholder refs (будут инициализированы при первом вызове useBridgeState)
let isInspectingRef = ref(false);
let isDesignModeRef = ref(false);

export function useBridgeState(bridge: AppBridge<TailwindProtocol>) {
  
  // Инициализация один раз
  if (!isInitialized) {
    // 1. Создаем "магические" переменные
    // bridge.state создает канал синхронизации. 
    // useSyncedRef делает из него обычный Vue Ref.
    // Изменишь .value здесь -> изменится в Iframe. Изменишь в Iframe -> изменится здесь.
    isInspectingRef = useSyncedRef(bridge.state('isInspecting', false));
    isDesignModeRef = useSyncedRef(bridge.state('isDesignMode', false));

    // 2. Логика взаимоисключения (если включил одно, выключи другое)
    watch(isInspectingRef, (val) => {
      if (val) isDesignModeRef.value = false;
    });
    watch(isDesignModeRef, (val) => {
      if (val) isInspectingRef.value = false;
    });

    // 3. Остальные слушатели
    bridge.on('update-classes', ({ udtId, classes }) => {
      const el = document.querySelector(`[data-udt-id="${udtId}"]`) as HTMLElement;
      if (el) {
        el.className = classes.join(' ');
        if (el === selectedElement.value) {
          updateSelectionInfo(el);
        }
      }
    });

    bridge.on('restore-selection', ({ loc }) => {
      if (!loc) return;
      const escapedLoc = loc.replace(/:/g, '\\:');
      let el = document.querySelector(`[data-udt-loc="${escapedLoc}"]`) as HTMLElement;
      
      if (!el) {
        const all = document.querySelectorAll('[data-udt-loc]');
        for (let i = 0; i < all.length; i++) {
            if (all[i].getAttribute('data-udt-loc') === loc) {
                el = all[i] as HTMLElement;
                break;
            }
        }
      }
      if (el) {
        selectElement(el);
      }
    });

    bridge.on('clear-selection', () => {
      resetState();
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

  const updateSelectionInfo = (el: HTMLElement) => {
    selectionInfo.tagName = el.tagName.toLowerCase();
    selectionInfo.id = el.id;
    selectionInfo.classes = Array.from(el.classList);
  };

  const sendElementUpdate = (el: HTMLElement) => {
    const sourceInfo = getElementSourceInfo(el);
    const computed = scanElementStyles(el);
    const textContent = el.innerText.length > 1000 ? el.innerText.slice(0, 1000) + '...' : el.innerText;
    
    const udtId = el.getAttribute('data-udt-id') || Math.random().toString(36).slice(2);
    if (!el.hasAttribute('data-udt-id')) el.setAttribute('data-udt-id', udtId);

    const state: ElementState = {
      udtId,
      tagName: el.tagName.toLowerCase(),
      classList: Array.from(el.classList).map(String),
      computed: Object.fromEntries(Object.entries(computed).map(([k, v]) => [String(k), String(v)])) as Record<string, string>,
      textContent,
      source: sourceInfo.source,
    };
    
    bridge.send('element-update', state);
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
    
    if (!el.hasAttribute('data-udt-id')) {
        el.setAttribute('data-udt-id', Math.random().toString(36).slice(2));
    }
    
    // Сохраняем data-udt-loc для восстановления после перезагрузки
    // Сначала проверяем сам элемент, потом ищем у родителей
    let loc = el.getAttribute('data-udt-loc');
    if (!loc) {
      let parent = el.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        const parentLoc = parent.getAttribute('data-udt-loc');
        if (parentLoc) {
          loc = parentLoc;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // Отправляем loc в UI контекст для сохранения через api.storage
    if (loc) {
      bridge.send('save-last-loc', { loc });
    }
    
    updateSelectionInfo(el);
    sendElementUpdate(el);
    
    // Просто меняем переменную. Bridge сам отправит это в Iframe.
    if (isInspectingRef.value) {
      isInspectingRef.value = false;
    }
  };

  const resetState = () => {
    selectedElement.value = null;
    // Просто меняем переменные
    isInspectingRef.value = false;
    isDesignModeRef.value = false;
    disableTextEditing();
    // Очищаем сохраненный элемент через bridge
    bridge.send('clear-last-loc', {});
  };

  return {
    selectedElement,
    selectionInfo,
    // Возвращаем Refs, которые можно читать и писать как обычные переменные
    isInspecting: isInspectingRef,
    isDesignMode: isDesignModeRef,
    selectElement,
    rescanElement: sendElementUpdate,
    resetState,
    findElementUnderCursor,
    updateSelectionInfo
  };
}
