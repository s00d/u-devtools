import { ref, onMounted } from 'vue';
import type { AppBridge } from '@u-devtools/core';

export interface ElementInfo {
  udtId: string; // Уникальный ID для надежной связи
  tagName: string;
  id: string;
  classes: string[];
  attrs: Record<string, string>;
  innerText?: string;
  rect: { x: number; y: number; width: number; height: number };
  styles?: {
    layout?: Record<string, string>;
    text?: Record<string, string>;
    appearance?: Record<string, string>;
    flex?: Record<string, string> | null;
  };
  computed?: Record<string, string>;
  breadcrumbs: Array<{ tagName: string; id: string; class: string }>;
  a11y?: {
    role: string;
    tabIndex: number;
    ariaLabel: string;
    ariaHidden: string;
    title: string;
    alt: string;
  };
  colors?: {
    color: string;
    bg: string;
    colorRaw: string;
    bgRaw: string;
  };
  domContext?: {
    parent: { tagName: string; id: string; classes: string[]; hasChildren: boolean } | null;
    siblings: Array<{ tagName: string; id: string; classes: string[]; hasChildren: boolean; isCurrent: boolean; index: number }>;
    children: Array<{ tagName: string; id: string; classes: string[]; hasChildren: boolean; index: number }>;
  };
}

/**
 * Composable for working with element data (get, update styles/attributes)
 */
export function useElementData(bridge: AppBridge) {
  const data = ref<ElementInfo | null>(null);
  const newAttrKey = ref('');
  const newAttrValue = ref('');
  const newClass = ref('');

  // Получаем текущий ID
  const id = () => data.value?.udtId;

  // --- Style Updates ---
  const updateStyle = (payload: { prop: string; value: string }) => {
    bridge.send('update-style', { ...payload, udtId: id() });
  };

  // --- Attribute Management ---
  const updateAttr = (name: string, value: string) => {
    bridge.send('update-attr', { name, value, udtId: id() });
  };

  const addAttr = (name?: string, value?: string) => {
    const attrName = name || newAttrKey.value.trim();
    const attrValue = value || newAttrValue.value.trim();
    if (!attrName) return;
    updateAttr(attrName, attrValue);
    if (!name) {
      newAttrKey.value = '';
      newAttrValue.value = '';
    }
  };

  const deleteAttr = (name: string) => {
    bridge.send('remove-attr', { name, udtId: id() });
  };

  // --- Class Management ---
  const addClass = (cls?: string) => {
    const className = cls || newClass.value.trim();
    if (!className) return;
    bridge.send('add-class', { cls: className, udtId: id() });
    if (!cls) {
    newClass.value = '';
    }
  };

  const removeClass = (cls: string) => {
    bridge.send('remove-class', { cls, udtId: id() });
  };

  const updateClasses = (classes: string[]) => {
    bridge.send('update-classes', { classes, udtId: id() });
  };

  // --- Listeners ---
  onMounted(() => {
    bridge.on<ElementInfo>('element-picked', (d: ElementInfo) => {
      data.value = d;
    });
  });

  return {
    data,
    newAttrKey,
    newAttrValue,
    newClass,
    updateStyle,
    updateAttr,
    addAttr,
    deleteAttr,
    addClass,
    removeClass,
    updateClasses,
  };
}

