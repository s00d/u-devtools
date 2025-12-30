import type { Component } from 'vue';
import { computed, ref } from 'vue';
import type { VirtualRoute } from '../types';

/**
 * Virtual router for tab navigation in Vue Inspector
 */
export function useVirtualRouter<T extends VirtualRoute[]>(
  routes: T,
  defaultRoute?: T[number]['path']
) {
  const defaultPath = defaultRoute ?? routes[0]?.path;
  const currentPath = ref<string>(defaultPath);

  const currentRoute = computed(() => {
    return routes.find((route) => route.path === currentPath.value);
  });

  const currentComponent = computed<Component | undefined>(() => {
    return currentRoute.value?.component as Component | undefined;
  });

  function push(path: string) {
    const route = routes.find((r) => r.path === path);
    if (route) {
      currentPath.value = path;
    }
  }

  function restore() {
    currentPath.value = defaultPath;
  }

  return {
    currentPath: computed(() => currentPath.value),
    currentRoute,
    currentComponent,
    routes: computed(() => routes),
    push,
    restore,
  };
}
