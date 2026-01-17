import type { PluginClientInstance, AppBridge } from '@u-devtools/core';
import { createApp } from 'vue';
import { setupDevTools } from './context';
import type { RemoteControlProtocol } from './types';
import RemoteControlPanel from './ui/RemoteControlPanel.vue';

const plugin: PluginClientInstance = {
  name: 'remote-control',
  icon: 'ComputerDesktop',

  renderMain(container: HTMLElement, api, { bridge }) {
    // Cast bridge to the required protocol
    const typedBridge = bridge as AppBridge<RemoteControlProtocol>;

    // Initialize context (once!)
    setupDevTools({ api, bridge: typedBridge });

    const app = createApp(RemoteControlPanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
