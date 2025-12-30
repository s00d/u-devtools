---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
// @ts-ignore - Svelte component types
import SveltePanel from './ui/SveltePanel.svelte';

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'Bolt',

  renderMain(container, api) {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('[Svelte Plugin] mount is only available in browser');
      return () => {};
    }

    // Динамически импортируем mount/unmount только в браузере
    // Это предотвращает ошибку "lifecycle_function_unavailable" на сервере
    return import('svelte')
      .then(({ mount, unmount }) => {
        // Используем mount из Svelte 5
        const app = mount(SveltePanel, {
          target: container,
          props: { api },
        });

        return () => {
          unmount(app);
        };
      })
      .catch((err) => {
        console.error('[Svelte Plugin] Failed to mount:', err);
        return () => {};
      }) as any; // Временное приведение типа, так как renderMain ожидает синхронную функцию
  },
};

export default plugin;

