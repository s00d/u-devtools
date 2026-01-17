import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import ViteInspectorPanel from './ui/ViteInspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vite Inspector',
  icon: 'Bolt',

  renderMain(container, api, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    const app = createApp(ViteInspectorPanel);
    app.mount(container);
    return () => {
      app.unmount();
      bridge.close();
    };
  },
};

export default plugin;
