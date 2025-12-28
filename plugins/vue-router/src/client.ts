import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import RouterPanel from './ui/RouterPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vue Router',
  icon: 'i-carbon-logo-vue',

  renderMain(container, api) {
    const app = createApp(RouterPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

