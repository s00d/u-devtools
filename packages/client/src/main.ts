import { createApp } from 'vue';
import App from './App.vue';

// 1. Импортируем стили как СТРОКУ (?inline)
// Vite обработает PostCSS/Tailwind и вернет готовый CSS код
import style from './style.css?inline';

// 2. Функция для внедрения стилей
function injectStyles() {
  const styleId = 'u-devtools-client-styles';
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = style;
  document.head.appendChild(styleEl);
}

// Внедряем стили перед монтированием
injectStyles();

const app = createApp(App);

// Добавляем глобальный обработчик ошибок для отладки
app.config.errorHandler = (err) => {
  console.error('[DevTools Error]:', err);
};

app.mount('#app');

// Скрываем лоадер после монтирования Vue приложения
const loader = document.getElementById('udt-loader');
if (loader) {
  loader.classList.add('hidden');
  // Удаляем элемент после завершения анимации
  setTimeout(() => {
    loader.remove();
  }, 300);
}
