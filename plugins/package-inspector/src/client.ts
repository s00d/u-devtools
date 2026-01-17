import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import PackagePanel from './ui/PackagePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Package Inspector',
  icon: 'Cube',

  renderMain(container, api, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    const app = createApp(PackagePanel);
    app.mount(container);
    return () => {
      app.unmount();
      bridge.close();
    };
  },
};

export default plugin;
