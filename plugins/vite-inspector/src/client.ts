import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import ViteInspectorPanel from './ui/ViteInspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vite Inspector',
  icon: 'i-carbon-flash',

  commands: [
    {
      id: 'vite.restart',
      label: 'Restart Vite Server',
      icon: 'i-carbon-restart',
      action: () => {
        // Будет привязано в компоненте через сигнал
        restartSignal.value();
      },
    },
    {
      id: 'vite.clearCache',
      label: 'Clear Vite Cache',
      icon: 'i-carbon-trash-can',
      action: () => {
        clearCacheSignal.value();
      },
    },
  ],

  renderMain(container, api) {
    const app = createApp(ViteInspectorPanel, {
      api,
      onRegisterActions: (restart: () => void, clearCache: () => void) => {
        restartSignal.value = restart;
        clearCacheSignal.value = clearCache;
      },
    });
    app.mount(container);
    return () => app.unmount();
  },
};

const restartSignal = { value: () => {} };
const clearCacheSignal = { value: () => {} };

export default plugin;

