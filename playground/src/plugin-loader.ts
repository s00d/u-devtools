import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PluginDefinition } from '@u-devtools/kit/define-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.resolve(__dirname, '../../plugins');

interface LoadedPlugin {
  name: string;
  plugin: PluginDefinition;
  packageName: string;
}

/**
 * Хелпер для динамической загрузки плагинов из папки plugins
 */
export async function getAutoDiscoveredPlugins(): Promise<LoadedPlugin[]> {
  const plugins: LoadedPlugin[] = [];

  // 1. Читаем папку plugins
  if (!fs.existsSync(pluginsDir)) {
    console.warn('[Playground] Plugins directory not found:', pluginsDir);
    return plugins;
  }

  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(pluginsDir, entry.name);
    const pkgJsonPath = path.join(pluginDir, 'package.json');
    const indexPath = path.join(pluginDir, 'src/index.ts');

    // 2. Проверяем, является ли папка валидным пакетом
    if (!fs.existsSync(pkgJsonPath)) {
      continue;
    }

    // 3. Проверяем наличие точки входа
    if (!fs.existsSync(indexPath)) {
      console.warn(`[Playground] Plugin ${entry.name} has no src/index.ts, skipping`);
      continue;
    }

    try {
      // 4. Читаем package.json для получения имени пакета
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      const packageName = pkgJson.name || `@u-devtools/plugin-${entry.name}`;

      // 5. Импортируем модуль
      // Используем pathToFileURL для корректного преобразования пути в file:// URL
      const { pathToFileURL } = await import('node:url');
      const moduleUrl = pathToFileURL(indexPath).href;
      const module = await import(moduleUrl);

      // 6. Ищем экспорт плагина
      // Приоритет: plugin (default export или named), затем функция с именем плагина
      let pluginFn: (() => PluginDefinition) | ((options?: any) => PluginDefinition) | undefined;

      if (module.plugin) {
        pluginFn = module.plugin;
      } else if (module.default && typeof module.default === 'function') {
        pluginFn = module.default;
      } else {
        // Ищем функцию, которая заканчивается на 'Plugin' или имя плагина
        const pluginName = entry.name.replace(/-/g, '');
        const possibleNames = [
          `${pluginName}Plugin`,
          `${entry.name}Plugin`,
          'plugin',
        ];

        for (const name of possibleNames) {
          if (module[name] && typeof module[name] === 'function') {
            pluginFn = module[name];
            break;
          }
        }
      }

      if (!pluginFn) {
        console.warn(`[Playground] Plugin ${entry.name} has no valid plugin export, skipping`);
        continue;
      }

      // 7. Вызываем функцию плагина (для плагинов с опциями нужно будет обработать отдельно)
      // Для i18n нужны опции, поэтому пропускаем его - он должен быть добавлен вручную
      if (entry.name === 'i18n') {
        console.log(`[Playground] Skipping ${entry.name} (requires options)`);
        continue;
      }

      const pluginInstance = typeof pluginFn === 'function' ? pluginFn() : pluginFn;

      if (pluginInstance) {
        console.log(`[Playground] Auto-loaded plugin: ${entry.name} (${packageName})`);
        plugins.push({
          name: entry.name,
          plugin: pluginInstance,
          packageName,
        });
      }
    } catch (e) {
      console.warn(`[Playground] Failed to load plugin ${entry.name}:`, e);
    }
  }

  return plugins;
}

/**
 * Получает список имен пакетов для ssr.noExternal
 */
export function getPluginPackageNames(plugins: LoadedPlugin[]): string[] {
  return plugins.map((p) => p.packageName);
}
