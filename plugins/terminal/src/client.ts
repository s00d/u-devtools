import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import TerminalPanel from './ui/TerminalPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Terminal',
  icon: 'i-carbon-terminal',

  renderMain(container, api) {
    const app = createApp(TerminalPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;

