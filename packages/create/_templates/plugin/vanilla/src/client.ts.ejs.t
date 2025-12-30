---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
import { createVanillaPanel } from './ui/vanilla-panel.js';

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'Code',

  renderMain(container, api) {
    return createVanillaPanel(container, api);
  },
};

export default plugin;

