import { ref, reactive } from 'vue';
import type { AppBridge } from '@u-devtools/core';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue';
import { getOverlayHost, OVERLAY_ID } from '@u-devtools/overlay';
import type { InspectorProtocol } from '../../types';

// --- GLOBAL SINGLETON STATE ---
let isInitialized = false;

// Создаем глобальные ссылки, чтобы они были доступны во всех компонентах App
const selectedElement = ref<HTMLElement | null>(null);
const selectionInfo = reactive({ 
  tagName: '', 
  id: '', 
  classes: [] as string[],
  attrs: {} as Record<string, string>,
  innerText: '',
  rect: { x: 0, y: 0, width: 0, height: 0 },
  styles: {} as any,
  computed: {} as any,
  breadcrumbs: [] as Array<{ tagName: string; id: string; class: string }>,
  a11y: {} as any,
  colors: {} as any,
  domContext: {} as any,
});

// Placeholder ref (будет инициализирован при первом вызове useBridgeState)
let isInspectingRef = ref(false);

export function useBridgeState(bridge: AppBridge<InspectorProtocol>) {
  
  // Инициализация один раз
  if (!isInitialized) {
    // 1. Создаем синхронизированную переменную через bridge.state()
    isInspectingRef = useSyncedRef(bridge.state('isInspecting', false));

    // 2. Остальные слушатели
    bridge.on('restore-selection', ({ selector }) => {
      if (!selector) return;
      try {
        const el = document.querySelector(selector) as HTMLElement;
        if (el) {
          selectElement(el);
        }
      } catch (e) {
        console.error('[Inspector] Failed to restore selection:', e);
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
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    // Явно сериализуем computed стили в строки
    const computed = Object.fromEntries(
      Array.from(styles).map(key => [String(key), String(styles.getPropertyValue(key))])
    ) as Record<string, string>;
    
    const attrs: Record<string, string> = {};
    Array.from(el.attributes).forEach(attr => {
      attrs[attr.name] = attr.value;
    });

    const breadcrumbs: Array<{ tagName: string; id: string; class: string }> = [];
    let current: HTMLElement | null = el;
    let depth = 0;
    while (current && depth < 10) {
      breadcrumbs.unshift({
        tagName: current.tagName.toLowerCase(),
        id: current.id || '',
        class: Array.from(current.classList).join(' '),
      });
      current = current.parentElement;
      depth++;
    }

    selectionInfo.tagName = el.tagName.toLowerCase();
    selectionInfo.id = el.id;
    // Убеждаемся, что classes - это массив строк
    selectionInfo.classes = Array.from(el.classList).map(String);
    selectionInfo.attrs = attrs;
    selectionInfo.innerText = el.innerText.slice(0, 1000);
    selectionInfo.rect = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    // Пустые объекты для будущего использования
    selectionInfo.styles = {};
    selectionInfo.computed = computed;
    selectionInfo.breadcrumbs = breadcrumbs;
    selectionInfo.a11y = {};
    selectionInfo.colors = {};
    selectionInfo.domContext = {};
  };

  const sendElementUpdate = (el: HTMLElement) => {
    const udtId = el.getAttribute('data-udt-id') || Math.random().toString(36).slice(2);
    if (!el.hasAttribute('data-udt-id')) el.setAttribute('data-udt-id', udtId);

    updateSelectionInfo(el);

    // Явно сериализуем все данные перед отправкой
    // Используем JSON.parse(JSON.stringify()) для глубокой сериализации
    const serializedData = JSON.parse(JSON.stringify({
      udtId: String(udtId),
      tagName: String(selectionInfo.tagName),
      id: String(selectionInfo.id),
      classes: selectionInfo.classes.map(String),
      attrs: Object.fromEntries(
        Object.entries(selectionInfo.attrs).map(([k, v]) => [String(k), String(v)])
      ),
      innerText: String(selectionInfo.innerText),
      rect: {
        x: Number(selectionInfo.rect.x),
        y: Number(selectionInfo.rect.y),
        width: Number(selectionInfo.rect.width),
        height: Number(selectionInfo.rect.height),
      },
      styles: {},
      computed: selectionInfo.computed,
      breadcrumbs: selectionInfo.breadcrumbs.map(b => ({
        tagName: String(b.tagName),
        id: String(b.id),
        class: String(b.class),
      })),
      a11y: {},
      colors: {},
      domContext: {},
    }));

    bridge.send('element-picked', serializedData);
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
    sendElementUpdate(el);
    
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
    selectionInfo,
    // Возвращаем Ref, который можно читать и писать как обычную переменную
    isInspecting: isInspectingRef,
    selectElement,
    resetState,
    findElementUnderCursor,
    updateSelectionInfo,
  };
}

