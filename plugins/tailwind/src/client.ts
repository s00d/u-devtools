import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { TailwindProtocol } from './types';
import TailwindPanel from './ui/TailwindPanel.vue';

const plugin: PluginClientInstance = {
  name: 'tailwind',
  icon: 'Squares2X2',

  renderMain(container, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<TailwindProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(TailwindPanel);
    app.mount(container);
    return () => {
      app.unmount();
      // bridge.close() не нужен здесь, так как PluginRenderer сам закроет мост
    };
  },
};

export default plugin;
