import { createApp } from 'vue';
import App from './App.vue';

// Импортируем локальный файл стилей, в котором настроены @source и импорты
import './style.css';

const app = createApp(App);

// Добавляем глобальный обработчик ошибок для отладки
app.config.errorHandler = (err) => {
  console.error('[DevTools Error]:', err);
};

app.mount('#app');
