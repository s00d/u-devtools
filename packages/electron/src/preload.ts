import { contextBridge, ipcRenderer } from 'electron';

// 1. Загружаем сохраненный конфиг из Main Process
let persistedConfig = {};
try {
  persistedConfig = ipcRenderer.sendSync('u-devtools:get-config-sync');
} catch (e) {
  console.error('Failed to load sync config:', e);
}

// 2. Мержим с дефолтным конфигом
contextBridge.exposeInMainWorld('__UDEVTOOLS_CONFIG__', {
  wsUrl: 'ws://localhost:3000',
  base: './',
  pluginServerUrl: 'http://localhost:3000',
  // Перезаписываем дефолты тем, что сохранено в файле
  ...persistedConfig 
});

// API для fallback-экрана (renderer.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Сброс данных
  clearStorage: () => ipcRenderer.invoke('u-devtools:clear-storage'),
  // Проверка доступности URL силами Node.js (без CORS)
  checkConnection: (url: string) => ipcRenderer.invoke('u-devtools:check-connection', url),
  // Перезагрузка страницы
  reload: () => ipcRenderer.invoke('u-devtools:reload'),
  // Экспортируем метод сохранения
  saveConfig: (data: any) => ipcRenderer.invoke('u-devtools:save-config', data),
});
