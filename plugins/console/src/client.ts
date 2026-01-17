import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp, h } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { ConsoleProtocol } from './types';
import ConsolePanel from './ui/ConsolePanel.vue';

const clearSignal = { value: () => {} };

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

  renderMain(container, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<ConsoleProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(() => h(ConsolePanel, {
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    }));
    
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
