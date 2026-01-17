export * from './overlay-utils';
export { default as UOverlayBox } from './components/UOverlayBox.vue';
export { useElementRect, type ElementRect } from './composables/useElementRect';
export { mountAppOverlay } from './overlay';
export { createToast, type Toast } from './toast';
// Re-export with alias for convenience
export { default as OverlayBox } from './components/UOverlayBox.vue';
