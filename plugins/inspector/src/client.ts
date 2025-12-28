import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import InspectorPanel from './ui/InspectorPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Inspector',
  icon: 'MagnifyingGlass',

  renderMain(el, api) {
    const app = createApp(InspectorPanel);
    app.mount(el);
    return () => app.unmount();
  },
};

export default plugin;
