import { definePlugin } from '@u-devtools/kit/define-plugin';
import type { ResolvedConfig, ViteDevServer } from 'vite';

// Store server state globally for this module,
// to pass it to setupServer
export const viteInspectorState = {
  currentConfig: null as ResolvedConfig | null,
  currentServer: null as ViteDevServer | null,
};

const viteInspectorPlugin = () =>
  definePlugin({
    name: 'vite-inspector',
    root: import.meta.url,
    client: './client',
    server: './server',
  });

export const plugin = viteInspectorPlugin;
export { viteInspectorPlugin };
