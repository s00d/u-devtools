import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import PackagePanel from './ui/PackagePanel.vue';

const plugin: PluginClientInstance = {
  name: 'Package Inspector',
  icon: 'Cube',

  renderMain(container, api) {
    const app = createApp(PackagePanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

