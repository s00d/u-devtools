import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import I18nPanel from './ui/I18nPanel.vue';

const refreshSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'i18n',
  icon: 'Language',

  commands: [
    {
      id: 'i18n.refresh',
      label: 'Refresh Translations',
      icon: 'ArrowPath',
      action: () => {
        refreshSignal.value();
      },
    },
  ],

  settings: {
    itemsPerPage: {
      label: 'Items Per Page',
      type: 'number',
      default: 30,
    },
  },

  renderMain(container, api) {
    const app = createApp(I18nPanel, {
      api,
      onRegisterRefresh: (fn: () => void) => {
        refreshSignal.value = fn;
      },
    });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;
