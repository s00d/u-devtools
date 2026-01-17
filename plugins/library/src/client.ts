import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { LibraryProtocol } from './types';
import LibraryPanel from './ui/LibraryPanel.vue';

const plugin: PluginClientInstance = {
  name: 'UI Library',
  icon: 'Swatch',

  renderMain(container, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<LibraryProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(LibraryPanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;

