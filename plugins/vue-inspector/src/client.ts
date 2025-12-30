import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import VueInspectorPanel from './ui/VueInspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Vue Inspector',
  icon: 'Cube',

  renderMain(container, api) {
    const app = createApp(VueInspectorPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

