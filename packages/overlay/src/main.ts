import { createApp } from 'vue';
import App from './App.vue';
import style from './style.css?inline';
import { OVERLAY_ID, OVERLAY_READY_EVENT } from './overlay-utils';

interface UDevToolsConfig {
  base?: string;
}

declare global {
  interface Window {
    __UDEVTOOLS_CONFIG__?: UDevToolsConfig;
  }
}

function init() {
  if (document.getElementById(OVERLAY_ID.HOST)) return;

  const host = document.createElement('div');
  host.id = OVERLAY_ID.HOST;
  // High z-index, pointer-events none so clicks pass through by default
  // Убираем потенциальные margin/padding от страницы и ставим высокий z-index
  host.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483647; margin: 0; padding: 0; border: 0;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // 1. Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  shadow.appendChild(styleEl);

  // 2. Layer structure
  
  // Layer 1: Plugins (Inspectors, visualizers)
  // z-index: 10. Должен быть ниже Shell.
  // Используем fixed, чтобы координаты внутри совпадали с clientX/clientY (без учета скролла)
  const pluginsLayer = document.createElement('div');
  pluginsLayer.id = OVERLAY_ID.PLUGINS;
  pluginsLayer.style.cssText = 'position: fixed; inset: 0; z-index: 10; pointer-events: none;';
  shadow.appendChild(pluginsLayer);

  // Layer 2: Shell (UI, Кнопки, Панели)
  // z-index: 20. Всегда поверх плагинов.
  const shellLayer = document.createElement('div');
  shellLayer.id = OVERLAY_ID.SHELL;
  shellLayer.style.cssText = 'position: fixed; inset: 0; z-index: 20; pointer-events: none;';
  shadow.appendChild(shellLayer);

  // Layer 3: Toasts
  const toastLayer = document.createElement('div');
  toastLayer.id = OVERLAY_ID.TOAST;
  toastLayer.style.cssText = 'position: fixed; inset: 0; z-index: 30; pointer-events: none;';
  shadow.appendChild(toastLayer);

  // 3. Mount Shell App
  // ВАЖНО: Убрали 'auto'. Теперь корень прозрачен для кликов.
  // Интерактивные элементы (Launcher, Iframe) должны иметь pointer-events: auto в своих стилях
  const appRoot = document.createElement('div');
  appRoot.style.cssText = 'width: 100%; height: 100%; pointer-events: none;';
  shellLayer.appendChild(appRoot);

  const app = createApp(App, { base: window.__UDEVTOOLS_CONFIG__?.base });
  app.mount(appRoot);

  // --- СИГНАЛ ГОТОВНОСТИ ---
  // Ставим флаг для тех, кто придет позже
  window.__UDEVTOOLS_OVERLAY_READY__ = true;
  // Диспатчим событие для тех, кто уже ждет
  window.dispatchEvent(new CustomEvent(OVERLAY_READY_EVENT));
}

// Запуск
if (document.body) {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
