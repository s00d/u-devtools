import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDevTools } from '@u-devtools/vite';
import { plugin as i18nPlugin } from '@u-devtools/plugin-i18n';
import { getAutoDiscoveredPlugins, getPluginPackageNames } from './src/plugin-loader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  // Автоматически загружаем плагины из папки plugins
  const autoPlugins = await getAutoDiscoveredPlugins();
  const autoPluginInstances = autoPlugins.map((p) => p.plugin);
  const autoPluginPackages = getPluginPackageNames(autoPlugins);

  return {
    plugins: [
      vue(),
      tailwindcss(),
      createDevTools({
        // Базовый путь, по которому будет доступен UI девтулза (в iframe)
        base: '/__devtools',
        plugins: [
          // Плагин переводов: смотрит в папку src/locales (требует опции, поэтому вручную)
          i18nPlugin({ dir: 'src/locales' }),

          // Автоматически загруженные плагины
          ...autoPluginInstances,
        ],
      }),
    ],
    resolve: {
      // ВАЖНО: Дедупликация Vue для предотвращения дублирования инстансов в монорепо
      dedupe: ['vue'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['fsevents', 'lightningcss'],
    },
    server: {
      // Разрешаем доступ к файловой системе для playground и корня монорепо
      fs: {
        allow: [
          __dirname, // Директория playground
          path.resolve(__dirname, '..'), // Корень монорепо
        ],
      },
    },
    ssr: {
      noExternal: [
        '@u-devtools/plugin-i18n', // Плагин с опциями, добавляем вручную
        '@u-devtools/react-test',
        ...autoPluginPackages, // Автоматически найденные плагины
      ],
      resolve: {
        conditions: ['development', 'default'],
      },
    },
  };
});
