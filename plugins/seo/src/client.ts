import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { SeoProtocol } from './types';
import SeoPanel from './ui/SeoPanel.vue';

const plugin: PluginClientInstance = {
  name: 'SEO',
  icon: 'PresentationChartLine',
  renderMain(el, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<SeoProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(SeoPanel);
    app.mount(el);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
