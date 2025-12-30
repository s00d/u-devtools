import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import ConsolePanel from './ui/ConsolePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Console',
  icon: 'CommandLine',

  commands: [
    {
      id: 'console.clear',
      label: 'Clear Console',
      icon: 'Trash',
      action: () => {
        clearSignal.value();
      },
    },
  ],

  renderMain(container, api) {
    const app = createApp(ConsolePanel, {
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
