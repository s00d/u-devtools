import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import TerminalPanel from './ui/TerminalPanel.vue';

const plugin: PluginClientInstance = {
  name: 'Terminal',
  icon: 'CommandLine', // Heroicons

  commands: [
    {
      id: 'term.clear',
      label: 'Clear Terminal',
      icon: 'Trash',
      action: () => { /* Можно реализовать через EventBus, если нужно вызывать снаружи */ }
    }
  ],

  // --- НОВЫЙ SDK НАСТРОЕК ---
  settings: {
    fontSize: {
      label: 'Font Size',
      type: 'number',
      default: 13
    },
    quickCommands: {
      label: 'Quick Commands',
      description: 'List of frequently used commands to show in the toolbar',
      type: 'array',
      default: [
        { label: 'List Files', cmd: 'ls -la' },
        { label: 'Build', cmd: 'npm run build' }
      ],
      items: {
        label: { label: 'Button Label', type: 'string' },
        cmd: { label: 'Command', type: 'string' }
      }
    }
  },

  renderMain(el, api) {
    const app = createApp(TerminalPanel, { api });
    app.mount(el);
    return () => app.unmount();
  }
};

export default plugin;

