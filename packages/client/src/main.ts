import { createApp } from 'vue';
import App from './App.vue';

// Импортируем только локальный файл, который уже настроен
// (в нем есть @import "../../ui/src/style.css" и tailwind)
import './style.css';

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
