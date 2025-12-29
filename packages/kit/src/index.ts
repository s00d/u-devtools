import type { DevToolsPlugin, RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { PluginOption } from 'vite';
import type { Options } from 'tsup';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export interface DefinePluginOptions {
  name: string;
  /**
   * Обязательно передавайте import.meta.url, чтобы мы могли вычислить пути
   */
  root: string;
  
  /**
   * Относительный путь к клиентскому файлу (без расширения или с ним)
   * @example './client'
   */
  client?: string;
  
  /**
   * Относительный путь к файлу приложения (без расширения или с ним)
   * @example './app'
   */
  app?: string;
  
  meta?: DevToolsPlugin['meta'];
  
  setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
  
  vitePlugins?: (() => PluginOption | PluginOption[])[];
}

/**
 * Умная фабрика для создания плагинов.
 * Автоматически разруливает пути для Dev (.ts) и Prod (.js) режимов.
 */
export function definePlugin(options: DefinePluginOptions): DevToolsPlugin {
  const { root, client, app, ...rest } = options;

  // Конвертируем URL файла в путь файловой системы
  const __filename = fileURLToPath(root);
  const __dirname = dirname(__filename);

  // Определяем режим по расширению текущего файла (index.ts или index.js)
  const isDev = __filename.endsWith('.ts');
  const targetExt = isDev ? '.ts' : '.js';

  // Хелпер для формирования абсолютного пути
  const resolvePath = (relativePath: string) => {
    // Убираем расширение, если пользователь его случайно написал
    const cleanPath = relativePath.replace(/\.(ts|js)$/, '');
    return resolve(__dirname, cleanPath + targetExt);
  };

  return {
    ...rest,
    clientPath: client ? resolvePath(client) : undefined,
    appPath: app ? resolvePath(app) : undefined,
  };
}

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
 * @deprecated Используйте definePlugin вместо этого
 */
export function defineDevToolsPlugin(plugin: DevToolsPlugin): DevToolsPlugin {
  return plugin;
}
