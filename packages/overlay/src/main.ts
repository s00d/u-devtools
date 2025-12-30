import { createApp } from 'vue';
import App from './App.vue';
import style from './style.css?inline'; // Это должно вернуть строку CSS

const MOUNT_ID = 'u-devtools-overlay-host';

interface UDevToolsConfig {
  base?: string;
}

declare global {
  interface Window {
    __UDEVTOOLS_CONFIG__?: UDevToolsConfig;
  }
}

function init() {
  if (document.getElementById(MOUNT_ID)) return;

  const host = document.createElement('div');
  host.id = MOUNT_ID;
  host.style.cssText = 'position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // 1. Вставляем стили в Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  shadow.appendChild(styleEl);

  // 2. Контейнер приложения
  const appRoot = document.createElement('div');
  shadow.appendChild(appRoot);

  const app = createApp(App, { base: window.__UDEVTOOLS_CONFIG__?.base });
  app.mount(appRoot);
}

// Запуск
if (document.body) {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
