import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import NetworkPanel from './ui/NetworkPanel.vue';

const clearSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'Network',
  icon: 'GlobeAlt',

  // --- ДОБАВЛЯЕМ НАСТРОЙКИ ---
  settings: {
    preserveLog: {
      label: 'Preserve Log',
      type: 'boolean',
      default: false
    },
    maxRequests: {
      label: 'History Limit',
      type: 'select',
      default: 100,
      options: [
        { label: '50 Requests', value: 50 },
        { label: '100 Requests', value: 100 },
        { label: '500 Requests', value: 500 },
      ]
    }
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

  renderMain(el, api) {
    const app = createApp(NetworkPanel, {
      api, // Передаем API, чтобы компонент мог читать настройки
      onRegisterClear: (fn: () => void) => {
        clearSignal.value = fn;
      },
    });
    app.mount(el);
    return () => app.unmount();
  },
};

export default plugin;
