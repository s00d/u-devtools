import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { SecurityProtocol } from './types';
import SecurityPanel from './ui/SecurityPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Security',
  icon: 'ShieldCheck',

  renderMain(el, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<SecurityProtocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(SecurityPanel);
    app.mount(el);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
