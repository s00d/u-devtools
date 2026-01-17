import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import TerminalPanel from './ui/TerminalPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Terminal',
  icon: 'CommandLine', // Heroicons

  commands: [
    {
      id: 'term.clear',
      label: 'Clear Terminal',
      icon: 'Trash',
      action: () => {
        /* Can implement via EventBus if need to call from outside */
      },
    },
  ],

  // --- NEW SETTINGS SDK ---
  settings: {
    fontSize: {
      label: 'Font Size',
      type: 'number',
      default: 13,
    },
    quickCommands: {
      label: 'Quick Commands',
      description: 'List of frequently used commands to show in the toolbar',
      type: 'array',
      default: [
        { label: 'List Files', cmd: 'ls -la' },
        { label: 'Build', cmd: 'npm run build' },
      ],
      items: {
        label: { label: 'Button Label', type: 'string' },
        cmd: { label: 'Command', type: 'string' },
      },
    },
  },

  renderMain(el, api, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    const app = createApp(TerminalPanel);
    app.mount(el);
    return () => {
      app.unmount();
      bridge.close();
    };
  },
};

export default plugin;
