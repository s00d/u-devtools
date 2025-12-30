import { createApp } from 'vue';
import App from './App.vue';

// 1. Магический импорт Vite: ?inline возвращает CSS как строку текста
import style from './style.css?inline';

const app = createApp(App);

// 2. Вставляем стили при запуске
function injectStyles() {
  // Проверка на дубликаты не помешает
  if (document.getElementById('udt-styles')) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'udt-styles';
  styleEl.textContent = style; // Сюда Vite подставит скомпилированный CSS
  document.head.appendChild(styleEl);
}

injectStyles();
app.mount('#app');

// Убираем лоадер
const loader = document.getElementById('udt-loader');
if (loader) {
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 300);
}
