import { definePlugin } from '@u-devtools/kit';
import type { PluginOption } from 'vite';
import VueInspector from 'vite-plugin-vue-inspector';
import { setupServer } from './server';

export const vueInspectorPlugin = () =>
  definePlugin({
    name: 'Vue Inspector',
    root: import.meta.url,
    client: './client',
    app: './app',
    setupServer,
    vitePlugins: [
      () =>
        VueInspector({
          toggleComboKey: '',
          toggleButtonVisibility: 'never',
          // launchEditor будет установлен через переменную окружения в setupServer
          appendTo: 'manually',
        }) as PluginOption,
    ],
  });
