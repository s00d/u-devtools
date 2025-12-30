import type { DevToolsPlugin, RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { PluginOption } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';

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

  /**
   * Принудительно использовать продакшн-пути (dist/file.js) даже в dev-режиме.
   * Полезно для отладки собранной версии плагина.
   * @default false
   */
  useDist?: boolean;
}

/**
 * Умная фабрика для создания плагинов.
 * Автоматически разруливает пути для Dev (.ts) и Prod (.js) режимов.
 */
export function definePlugin(options: DefinePluginOptions): DevToolsPlugin {
  const { root, client, app, useDist, ...rest } = options;

  // Конвертируем URL файла в путь файловой системы
  const __filename = fileURLToPath(root);
  const __dirname = dirname(__filename);

  // Определяем режим по расширению текущего файла (index.ts или index.js)
  const isDev = __filename.endsWith('.ts');

  // Если включен useDist, мы принудительно используем .js, иначе как обычно
  const targetExt = (isDev && !useDist) ? '.ts' : '.js';

  // Хелпер для формирования абсолютного пути
  const resolvePath = (relativePath: string) => {
    // Убираем расширение, если пользователь его случайно написал
    const cleanPath = relativePath.replace(/\.(ts|js)$/, '');

    let baseDir = __dirname;

    // МАГИЯ: Если мы в dev (src/*.ts), но хотим dist:
    // Пытаемся выйти из папки 'src' и зайти в 'dist'
    if (isDev && useDist) {
      // Проверяем, что мы действительно в папке src
      if (basename(baseDir) === 'src') {
        // Поднимаемся на уровень вверх и идем в dist
        baseDir = resolve(baseDir, '../dist');
      }
    }

    return resolve(baseDir, cleanPath + targetExt);
  };

  return {
    ...rest,
    clientPath: client ? resolvePath(client) : undefined,
    appPath: app ? resolvePath(app) : undefined,
  };
}
