import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import StoragePanel from './ui/StoragePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Storage',
  icon: 'ServerStack',

  commands: [
    {
      id: 'storage.clear',
      label: 'Clear All Storage',
      icon: 'Trash',
      action: () => {
        clearSignal.value();
      },
    },
  ],

  renderMain(container, api) {
    const app = createApp(StoragePanel, {
      api,
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    });
    app.mount(container);
    return () => app.unmount();
  },
};

const clearSignal = { value: () => {} };

export default plugin;

