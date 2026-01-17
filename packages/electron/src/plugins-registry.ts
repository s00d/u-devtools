import type { DevToolsPlugin, RpcServerInterface, ServerContext } from '@u-devtools/core';

// Импорты плагинов
import { repo2txtPlugin } from '@u-devtools/plugin-repo2txt';
import { setupServer as setupRepo2Txt } from '@u-devtools/plugin-repo2txt/src/server';
import { consolePlugin } from '@u-devtools/plugin-console';
import { networkPlugin } from '@u-devtools/plugin-network';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';
import { storagePlugin } from '@u-devtools/plugin-storage';
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { setupServer as setupI18n } from '@u-devtools/plugin-i18n/src/server';
import { pluginManager } from '@u-devtools/plugin-manager';
import { setupServer as setupManager } from '@u-devtools/plugin-manager/src/server';
import { seoPlugin } from '@u-devtools/plugin-seo';
import { setupServer as setupSeo } from '@u-devtools/plugin-seo/src/server';
import { tailwindPlugin } from '@u-devtools/plugin-tailwind';
import { setupServer as setupTailwind } from '@u-devtools/plugin-tailwind/src/server';
import { terminalPlugin } from '@u-devtools/plugin-terminal';
// @ts-expect-error
import { setupServer as setupTerminal } from '@u-devtools/plugin-terminal/src/server';
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';
// @ts-expect-error
import { setupServer as setupViteInspector } from '@u-devtools/plugin-vite-inspector/src/server';
import { vueInspectorPlugin } from '@u-devtools/plugin-vue-inspector';
// @ts-expect-error
import { setupServer as setupVueInspector } from '@u-devtools/plugin-vue-inspector/src/server';
import { packageInspectorPlugin } from '@u-devtools/plugin-package-inspector';
// @ts-expect-error
import { setupServer as setupPackageInspector } from '@u-devtools/plugin-package-inspector/src/server';
import { componentsbookPlugin } from '@u-devtools/plugin-componentsbook';
import { setupServer as setupComponentsbook } from '@u-devtools/plugin-componentsbook/src/server';
import { libraryPlugin } from '@u-devtools/plugin-library';
import { setupServer as setupLibrary } from '@u-devtools/plugin-library/src/server';
import { remoteControlPlugin } from '@u-devtools/plugin-remote-control';
import { setupServer as setupRemoteControl } from '@u-devtools/plugin-remote-control/src/server';

interface PluginDefinition {
  factory: () => DevToolsPlugin;
  setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
  options?: any;
}

export const getPluginsList = (projectRoot: string): PluginDefinition[] => [
  { factory: repo2txtPlugin, setupServer: setupRepo2Txt },
  { factory: consolePlugin },
  { factory: networkPlugin },
  { factory: inspectorPlugin },
  { factory: storagePlugin },
  { factory: () => i18nPlugin({ dir: `${projectRoot}/src/locales` }), setupServer: setupI18n },
  { factory: pluginManager, setupServer: setupManager },
  { factory: seoPlugin, setupServer: setupSeo },
  { factory: tailwindPlugin, setupServer: setupTailwind },
  { factory: terminalPlugin, setupServer: setupTerminal },
  { factory: viteInspectorPlugin, setupServer: setupViteInspector },
  { factory: vueInspectorPlugin, setupServer: setupVueInspector },
  { factory: packageInspectorPlugin, setupServer: setupPackageInspector },
  { factory: componentsbookPlugin, setupServer: setupComponentsbook },
  { factory: libraryPlugin, setupServer: setupLibrary },
  { factory: remoteControlPlugin, setupServer: setupRemoteControl },
];
