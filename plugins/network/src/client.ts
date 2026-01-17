import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp, h } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { NetworkProtocol } from './types';
import NetworkPanel from './ui/NetworkPanel.vue';

const clearSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'Network',
  icon: 'GlobeAlt',

  // --- ADD SETTINGS ---
  settings: {
    preserveLog: {
      label: 'Preserve Log',
      type: 'boolean',
      default: false,
    },
    maxRequests: {
      label: 'History Limit',
      type: 'number',
      default: 100,
    },
  },
  // ---------------------------

  commands: [
    {
      id: 'net.clear',
      label: 'Clear Requests',
      icon: 'Trash',
      action: () => {
        clearSignal.value();
      },
    },
  ],

  renderMain(el, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<NetworkProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(() => h(NetworkPanel, {
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    }));
    
    app.mount(el);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
