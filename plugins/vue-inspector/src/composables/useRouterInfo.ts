import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AppBridge } from '@u-devtools/core';
import type { RouteInfo } from '../types';

/**
 * Composable for Vue Router functionality
 */
export function useRouterInfo() {
  const routerInfo = ref<RouteInfo | null>(null);
  const isLoading = ref(false);

  const bridge = new AppBridge('vue-inspector');

  // Computed properties
  const currentRoute = computed(() => {
    return routerInfo.value?.currentRoute || null;
  });

  const routes = computed(() => {
    return routerInfo.value?.routes || [];
  });

  const history = computed(() => {
    return routerInfo.value?.history || [];
  });

  // --- Actions ---

  const getRouterInfo = () => {
    try {
      isLoading.value = true;
      bridge.send('inspector:getRouterInfo');
    } catch (_e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const navigateToRoute = (path: string) => {
    try {
      bridge.send('inspector:navigateToRoute', { path });
      // Refresh router info after navigation
      setTimeout(() => {
        getRouterInfo();
      }, 100);
    } catch (_e) {
      // Ignore if bridge is closed
    }
  };

  // --- Listeners ---

  bridge.on('inspector:routerInfo', (info: RouteInfo) => {
    routerInfo.value = info;
    isLoading.value = false;
  });

  // --- Lifecycle ---

  onMounted(() => {
    getRouterInfo();
    // Polling to track route changes
    const timer = setInterval(getRouterInfo, 1000);
    onUnmounted(() => clearInterval(timer));
  });

  onUnmounted(() => {
    // Don't close bridge - it's shared
  });

  return {
    routerInfo,
    currentRoute,
    routes,
    history,
    isLoading,
    getRouterInfo,
    navigateToRoute,
  };
}
