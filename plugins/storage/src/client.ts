import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import StoragePanel from './ui/StoragePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Storage',
  icon: 'CircleStack',

  renderMain(container, api) {
    const app = createApp(StoragePanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;
