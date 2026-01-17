import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp, h } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { VueInspectorProtocol } from './types';
import VueInspectorPanel from './ui/VueInspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vue Inspector',
  icon: 'Cube',

  renderMain(container, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<VueInspectorProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(VueInspectorPanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
