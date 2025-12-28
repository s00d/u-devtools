import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import NetworkPanel from './ui/NetworkPanel.vue';

const clearSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'Network',
  icon: 'i-carbon-network-4',

  commands: [
    {
      id: 'net.clear',
      label: 'Clear Requests',
      icon: 'i-carbon-clean',
      action: () => {
        clearSignal.value();
      },
    },
  ],

  renderMain(el, api) {
    const app = createApp(NetworkPanel, {
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    });
    app.mount(el);
    return () => app.unmount();
  },
};

export default plugin;
