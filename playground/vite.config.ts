import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { networkPlugin } from '@u-devtools/plugin-network';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';
import { terminalPlugin } from '@u-devtools/plugin-terminal';
import { storagePlugin } from '@u-devtools/plugin-storage';
import { packageInspectorPlugin } from '@u-devtools/plugin-package-inspector';
import { vueInspectorPlugin } from '@u-devtools/plugin-vue-inspector';
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';
import { consolePlugin } from '@u-devtools/plugin-console';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    createDevTools({
      // Базовый путь, по которому будет доступен UI девтулза (в iframe)
      base: '/__devtools',
      plugins: [
        // Плагин переводов: смотрит в папку src/locales
        i18nPlugin({ dir: 'src/locales' }),

        consolePlugin(),
        // Плагин сети: перехватывает fetch/xhr
        networkPlugin(),

        // Плагин инспектора: позволяет выбирать элементы
        inspectorPlugin(),

        // Плагин терминала: полноценный терминал с поддержкой любых команд
        terminalPlugin(),

        // Плагин хранилища: просмотр LocalStorage/SessionStorage/Cookies
        storagePlugin(),

        // Плагин инспектора пакетов: просмотр зависимостей
        packageInspectorPlugin(),

        // Плагин Vue Inspector: инспектор маршрутов (Vue-specific)
        vueInspectorPlugin(),

        // Плагин Vite Inspector: диагностика и управление Vite
        viteInspectorPlugin(),
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
      '@u-devtools/plugin-i18n',
      '@u-devtools/plugin-network',
      '@u-devtools/plugin-inspector',
      '@u-devtools/plugin-terminal',
      '@u-devtools/plugin-storage',
      '@u-devtools/plugin-package-inspector',
      '@u-devtools/plugin-vue-inspector',
      '@u-devtools/plugin-vite-inspector',
      '@u-devtools/plugin-console',
    ],
    resolve: {
      conditions: ['development', 'default'],
    },
  },
});
