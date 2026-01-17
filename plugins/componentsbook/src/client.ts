import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { ComponentsbookProtocol } from './types';
import ComponentsbookPanel from './ui/ComponentsbookPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Componentsbook',
  icon: 'CodeBracket',

  renderMain(container: HTMLElement, api, { bridge }) {
    // Приводим тип bridge к нужному протоколу
    const typedBridge = bridge as AppBridge<ComponentsbookProtocol>;

    // Initialize context
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });

    // Handle story path requests from app context
    typedBridge.on('componentsbook:request-story-path', async ({ path }) => {
      try {
        // Request resolved path from server
        const resolvedPath = await api.rpc.call<string>('componentsbook:get-story-path', { path });
        // Send response back to app context
        typedBridge.send('componentsbook:story-path-response', { path, resolvedPath });
      } catch (e) {
        console.error('[componentsbook] Error getting story path:', e);
        typedBridge.send('componentsbook:story-path-response', { path, resolvedPath: '' });
      }
    });

    const app = createApp(ComponentsbookPanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
