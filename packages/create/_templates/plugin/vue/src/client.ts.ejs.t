---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { <%= pluginName.replace(/\s+/g, '') %>Protocol } from './types';
<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
  
  const panelComponentName = pluginName.replace(/\s+/g, '');
  const panelFileName = panelComponentName + 'Panel.vue';
-%>
import <%= panelComponentName %>Panel from './ui/<%= panelFileName %>';

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'Cube',

  renderMain(container: HTMLElement, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<<%= pluginName.replace(/\s+/g, '') %>Protocol>;
    
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const app = createApp(<%= panelComponentName %>Panel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
