<script setup lang="ts">
import { ref } from 'vue';
import { useElementBounding, useEventListener } from '@vueuse/core';
import { useBridge } from '../context';
import { useBridgeState } from './composables/useBridgeState';
import { UOverlayBox as OverlayBox, type ElementRect } from '@u-devtools/overlay';
import DesignToolbar from './designer/toolbar/DesignToolbar.vue';
import { OVERLAY_ID } from '@u-devtools/overlay';

const bridge = useBridge();
// Берем глобальные реактивные переменные
const { 
  selectedElement, 
  isDesignMode, 
  isInspecting, 
  selectElement, 
  findElementUnderCursor,
  selectionInfo 
} = useBridgeState(bridge);

// Local UI state
const hoveredElement = ref<HTMLElement | null>(null);

// VueUse helpers
const hoverRect = useElementBounding(hoveredElement);
const selectRect = useElementBounding(selectedElement);

// --- LOGIC ---

const isInternalUI = (el: Element | null) => {
  if (!el) return false;
  return el.id === OVERLAY_ID.HOST || el.closest(`#${OVERLAY_ID.HOST}`) !== null;
};

// 1. Mouse Move: просто обновляем hoveredElement
useEventListener(window, 'mousemove', (e: MouseEvent) => {
  // Если ничего не активно - выходим
  if (!isInspecting.value && !isDesignMode.value) {
    if (hoveredElement.value) hoveredElement.value = null;
    return;
  }

  // Если курсор над интерфейсом плагина - не выделяем под ним
  if (isInternalUI(e.target as Element)) return;

  const el = findElementUnderCursor(e.clientX, e.clientY);

  if (el && el !== selectedElement.value) {
    hoveredElement.value = el;
  } else {
    hoveredElement.value = null;
  }
}, { capture: true, passive: true });

// 2. Click: выбираем элемент
useEventListener(window, 'click', (e: MouseEvent) => {
  if (!isInspecting.value && !isDesignMode.value) return;
  if (isInternalUI(e.target as Element)) return;

  if (hoveredElement.value) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    selectElement(hoveredElement.value);
    hoveredElement.value = null;
  }
}, { capture: true });

// Helpers - преобразуем useElementBounding в ElementRect
const getRectProps = (boundingBox: typeof hoverRect, element: HTMLElement | null): ElementRect | null => {
  if (!element || !boundingBox.width.value || !boundingBox.height.value) return null;
  
  const styles = window.getComputedStyle(element);
  const getVal = (prop: string) => parseFloat(styles.getPropertyValue(prop)) || 0;
  
  return {
    top: boundingBox.top.value,
    left: boundingBox.left.value,
    width: boundingBox.width.value,
    height: boundingBox.height.value,
    marginTop: getVal('margin-top'),
    marginRight: getVal('margin-right'),
    marginBottom: getVal('margin-bottom'),
    marginLeft: getVal('margin-left'),
    paddingTop: getVal('padding-top'),
    paddingRight: getVal('padding-right'),
    paddingBottom: getVal('padding-bottom'),
    paddingLeft: getVal('padding-left'),
    borderTop: getVal('border-top-width'),
    borderRight: getVal('border-right-width'),
    borderBottom: getVal('border-bottom-width'),
    borderLeft: getVal('border-left-width'),
  };
};

const getLabel = (el: HTMLElement) => el.tagName.toLowerCase();
</script>

<template>
  <div 
    v-if="isInspecting || isDesignMode || selectedElement" 
    class="fixed inset-0 w-full h-full pointer-events-none z-[2000]"
  >
    <!-- HOVER HIGHLIGHT -->
    <OverlayBox 
      v-if="hoveredElement && hoverRect.width.value > 0 && (isInspecting || isDesignMode) && getRectProps(hoverRect, hoveredElement)"
      :rect="getRectProps(hoverRect, hoveredElement)!"
      :show-model="true"
      color="#6366f1" 
      :label="getLabel(hoveredElement)"
    />

    <!-- SELECTED ELEMENT -->
    <template v-if="selectedElement && selectRect.width.value > 0 && getRectProps(selectRect, selectedElement)">
      <OverlayBox 
        :rect="getRectProps(selectRect, selectedElement)!"
        :show-model="false"
        color="#06b6d4"
        :label="selectionInfo.tagName"
      />
      
      <!-- TOOLBAR -->
      <div class="pointer-events-auto">
        <DesignToolbar :rect="getRectProps(selectRect, selectedElement)!" />
      </div>
    </template>
  </div>
</template>
