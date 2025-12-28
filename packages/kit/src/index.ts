export * from '@u-devtools/core';
export * from '@u-devtools/bridge';

import type { DevToolsPlugin } from '@u-devtools/core';
import type { Options } from 'tsup';

/**
 * Хелпер для создания конфига сборки плагина
 * Настраивает правильные external зависимости, чтобы плагин не бандлил общие библиотеки
 */
export function createPluginBuildConfig(options: {
  entry: string[];
  name: string;
}): Options {
  return {
    entry: options.entry,
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    // ВАЖНО: Эти пакеты никогда не должны попадать в бандл плагина!
    // Они должны браться из host-окружения
    external: [
      'vite',
      'vue',
      '@u-devtools/core',
      '@u-devtools/ui',
      '@u-devtools/bridge',
    ],
  };
}

/**
 * Хелпер для типизации плагина (аналогично defineComponent в Vue)
 */
export function defineDevToolsPlugin(plugin: DevToolsPlugin): DevToolsPlugin {
  return plugin;
}
