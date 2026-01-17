import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import ManagerPanel from './ui/ManagerPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Plugins',
  icon: 'Squares2X2',
  hideFromMenu: true, // Hide from main menu, only accessible via General

  // Add item to General menu
  generalMenuItems: [
    {
      label: 'Extensions',
      icon: 'Squares2X2',
      action: (api: ClientApi) => {
        // Switch to this plugin
        api.navigation.openPlugin('Plugins');
      },
    },
  ],

  // Render panel
  renderMain(container: HTMLElement, api: ClientApi, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    const app = createApp(ManagerPanel);
    app.mount(container);
    return () => {
      app.unmount();
      bridge.close();
    };
  },
};

export default plugin;
