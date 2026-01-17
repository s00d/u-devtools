import { ref, watch, onUnmounted } from 'vue';
import { useRafFn } from '@vueuse/core';

export interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  // Computed styles for box model visualization
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderTop: number;
  borderRight: number;
  borderBottom: number;
  borderLeft: number;
}

export function useElementRect(elementRef: { value: HTMLElement | null }) {
  const rect = ref<ElementRect | null>(null);
  const isVisible = ref(false);

  // Use requestAnimationFrame for perfect synchronization during scroll
  const { pause, resume } = useRafFn(() => {
    const el = elementRef.value;
    if (!el || !el.isConnected) {
      isVisible.value = false;
      return;
    }

    // 1. Get coordinates relative to viewport
    // Since our overlay is position: fixed, these coordinates can be used directly
    const domRect = el.getBoundingClientRect();

    // If element is off-screen or invisible - hide overlay
    if (domRect.width === 0 && domRect.height === 0) {
      isVisible.value = false;
      return;
    }

    // 2. Read styles (only if needed for box model)
    const styles = window.getComputedStyle(el);
    const getVal = (prop: string) => parseFloat(styles.getPropertyValue(prop)) || 0;

    rect.value = {
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      
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
    
    isVisible.value = true;
  }, { immediate: false });

  watch(() => elementRef.value, (el) => {
    if (el) resume();
    else {
      pause();
      isVisible.value = false;
    }
  });

  onUnmounted(() => pause());

  return { rect, isVisible };
}
