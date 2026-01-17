import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { InspectorProtocol } from './types';
import InspectorPanel from './ui/InspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Inspector',
  icon: 'MagnifyingGlass',

  renderMain(el, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<InspectorProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(InspectorPanel);
    app.mount(el);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
