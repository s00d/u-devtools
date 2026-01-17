import { definePlugin } from '@u-devtools/kit/define-plugin';
import type { PluginOption } from 'vite';
import VueInspector from 'vite-plugin-vue-inspector';

const vueInspectorPlugin = () =>
  definePlugin({
    name: 'vue-inspector',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
    vitePlugins: [
      () =>
        VueInspector({
          toggleComboKey: '',
          toggleButtonVisibility: 'never',
          // launchEditor will be set via environment variable in setupServer
          appendTo: 'manually',
        }) as PluginOption,
    ],
  });

export const plugin = vueInspectorPlugin;
export { vueInspectorPlugin };
