<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, onErrorCaptured } from 'vue';
import type { ClientApi, UnmountFn } from '@u-devtools/core';

const props = defineProps<{
  api: ClientApi;
  renderer?: (el: HTMLElement, api: ClientApi) => UnmountFn | void;
}>();

const container = ref<HTMLElement | null>(null);
const error = ref<Error | null>(null);
let cleanup: UnmountFn | undefined | void;

const mount = () => {
  error.value = null;

  if (cleanup && typeof cleanup === 'function') {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    cleanup = undefined;
  }

  if (!container.value) return;
  container.value.innerHTML = '';

  if (props.renderer) {
    try {
      cleanup = props.renderer(container.value, props.api);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      error.value = err;
      console.error('Plugin render error:', err);
      if (container.value) {
        container.value.innerHTML = `
          <div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div class="flex items-center gap-2 mb-2">
              <div class="i-carbon-warning text-red-600 dark:text-red-400" />
              <h3 class="font-semibold text-red-800 dark:text-red-200">Plugin Error</h3>
            </div>
            <p class="text-sm text-red-700 dark:text-red-300">${err.message}</p>
            <details class="mt-2">
              <summary class="text-xs text-red-600 dark:text-red-400 cursor-pointer">Stack trace</summary>
              <pre class="mt-1 text-xs text-red-600 dark:text-red-400 font-mono">${err.stack || 'No stack trace available'}</pre>
            </details>
          </div>
        `;
      }
    }
  }
};

onErrorCaptured((err) => {
  error.value = err;
  console.error('Plugin error captured:', err);
  if (container.value && !container.value.innerHTML.includes('Plugin Error')) {
    container.value.innerHTML = `
      <div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <div class="flex items-center gap-2 mb-2">
          <div class="i-carbon-warning text-red-600 dark:text-red-400" />
          <h3 class="font-semibold text-red-800 dark:text-red-200">Plugin Crashed</h3>
        </div>
        <p class="text-sm text-red-700 dark:text-red-300">${err.message}</p>
      </div>
    `;
  }
  return false;
});

watch(() => props.renderer, mount);

onMounted(mount);

onBeforeUnmount(() => {
  if (cleanup && typeof cleanup === 'function') {
    try {
      cleanup();
    } catch (e) {
      console.error('Error during unmount cleanup:', e);
    }
  }
});
</script>

<template>
  <div ref="container" class="h-full w-full overflow-auto relative">
    <!-- Плагин будет рендериться сюда -->
  </div>
</template>
