import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { StorageProtocol } from './types';
import StoragePanel from './ui/StoragePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Storage',
  icon: 'CircleStack',

  renderMain(container, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<StorageProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(StoragePanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
