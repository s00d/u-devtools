---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './ui/MyPanel.vue';
<% if (features.includes('sidebar')) { -%>
import SidebarPanel from './ui/SidebarPanel.vue';
<% } -%>

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'Cube', // Heroicons icon name

<% if (features.includes('settings')) { -%>
  // Settings schema (optional)
  settings: {
    enabled: {
      label: 'Enable Feature',
      type: 'boolean',
      default: true,
    },
    refreshInterval: {
      label: 'Refresh Interval (ms)',
      type: 'number',
      default: 1000,
    },
    theme: {
      label: 'Theme',
      type: 'select',
      default: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
  },
<% } -%>

<% if (features.includes('commands')) { -%>
  // Command Palette commands (optional)
  commands: [
    {
      id: '<%= pluginKebab %>:refresh',
      label: 'Refresh Data',
      icon: 'ArrowPath',
      action: () => {
        console.log('Refresh command executed');
      },
    },
    {
      id: '<%= pluginKebab %>:clear',
      label: 'Clear All',
      icon: 'Trash',
      action: () => {
        console.log('Clear command executed');
      },
    },
  ],
<% } -%>

  // Main panel renderer (required)
  renderMain(container: HTMLElement, api: any) {
    const app = createApp(MyPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },

<% if (features.includes('sidebar')) { -%>
  // Sidebar renderer (optional)
  renderSidebar(container: HTMLElement, api: any) {
    const app = createApp(SidebarPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },
<% } -%>
};

export default plugin;

