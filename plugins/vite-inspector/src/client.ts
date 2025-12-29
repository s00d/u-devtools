import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import ViteInspectorPanel from './ui/ViteInspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vite Inspector',
  icon: 'Bolt',

  renderMain(container, api) {
    const app = createApp(ViteInspectorPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

