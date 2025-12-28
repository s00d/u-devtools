import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { networkPlugin } from '@u-devtools/plugin-network';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';
import { terminalPlugin } from '@u-devtools/plugin-terminal';
import { storagePlugin } from '@u-devtools/plugin-storage';
import { packageInspectorPlugin } from '@u-devtools/plugin-package-inspector';
import { vueRouterPlugin } from '@u-devtools/plugin-vue-router';
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';
import path from 'node:path';

export default defineConfig({
  plugins: [
    vue(),
    createDevTools({
      // Базовый путь, по которому будет доступен UI девтулза (в iframe)
      base: '/__devtools',
      plugins: [
        // Плагин переводов: смотрит в папку src/locales
        i18nPlugin({ dir: 'src/locales' }),
        
        // Плагин сети: перехватывает fetch/xhr
        networkPlugin(),
        
        // Плагин инспектора: позволяет выбирать элементы
        inspectorPlugin(),
        
        // Плагин терминала: запуск npm скриптов
        terminalPlugin(),
        
        // Плагин хранилища: просмотр LocalStorage/SessionStorage/Cookies
        storagePlugin(),
        
        // Плагин инспектора пакетов: просмотр зависимостей
        packageInspectorPlugin(),
        
        // Плагин Vue Router: инспектор маршрутов (Vue-specific)
        vueRouterPlugin(),
        
        // Плагин Vite Inspector: диагностика и управление Vite
        viteInspectorPlugin()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname)],
    },
  },
});

