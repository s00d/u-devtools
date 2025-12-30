import { createApp } from 'vue';
import App from './App.vue';
// Импортируем стили как СТРОКУ (?inline)
// Vite обработает PostCSS/Tailwind и вернет готовый CSS код
import style from './style.css?inline';

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

  // Читаем конфиг из window
  const config = window.__UDEVTOOLS_CONFIG__ || {};
  const base = config.base || '/__devtools';

  const host = document.createElement('div');
  host.id = MOUNT_ID;
  host.style.cssText =
    'position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  shadow.appendChild(styleEl);

  const appRoot = document.createElement('div');
  // Важно: вернуть pointer-events auto контейнеру приложения,
  // иначе клики будут проходить сквозь кнопку
  appRoot.style.pointerEvents = 'auto';
  shadow.appendChild(appRoot);

  const app = createApp(App, { base });
  app.mount(appRoot);
}

// Запуск
if (document.body) {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
