import { definePlugin } from '@u-devtools/kit/define-plugin';
import type { Plugin } from 'vite';

// Этот плагин предотвращает падение браузера при импорте компонента с блоком <docs>
// Он удаляет блок <docs> из исходного кода до парсинга Vue компилятором
const vueDocsBlockPlugin = (): Plugin => ({
  name: 'vite:vue-docs-block',
  enforce: 'pre',
  transform(code, id) {
    // Обработка блока docs как отдельного модуля
    if (/vue&type=docs/.test(id)) {
      // Возвращаем функцию, которая ничего не делает, или прикрепляет доки к компоненту
      // Это предотвращает попытку браузера распарсить Markdown как JS
      return `export default (Comp) => {
        Comp.docs = ${JSON.stringify(code)}
      }`;
    }
    
    // Удаляем блок <docs> из исходного кода .vue файлов до парсинга
    if (id.endsWith('.vue') && code.includes('<docs')) {
      // Удаляем блок <docs>...</docs> из кода
      const cleanedCode = code.replace(/<docs[^>]*>[\s\S]*?<\/docs>/gi, '');
      return cleanedCode;
    }
    
    return null;
  },
});

export const componentsbookPlugin = () =>
  definePlugin({
    name: 'componentsbook',
    root: import.meta.url,
    client: './client',
    app: './app',
    server: './server',
    // Внедряем плагин в конфигурацию Vite приложения
    vitePlugins: [() => vueDocsBlockPlugin()],
  });

export const plugin = componentsbookPlugin;
