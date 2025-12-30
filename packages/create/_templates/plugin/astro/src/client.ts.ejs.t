---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
import './ui/astro-panel';
// Импортируем класс для типизации, но регистрация происходит через side-effect импорта выше
import type { AstroPanel } from './ui/astro-panel';

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'RocketLaunch',

  renderMain(container: HTMLElement, api: ClientApi) {
    // Создаем элемент веб-компонента
    const element = document.createElement('astro-panel') as AstroPanel;
    
    // Передаем API
    element.api = api;
    
    // Монтируем
    container.appendChild(element);

    return () => {
      element.remove();
    };
  },
};

export default plugin;

