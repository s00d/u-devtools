import { shallowRef, triggerRef } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { useBridge } from '../../context';
import { TailwindElement } from '../models/TailwindElement';
import type { ElementState } from '../../types';

const activeElement = shallowRef<TailwindElement | null>(null);

export function useActiveElement(api?: ClientApi) {
  // Получаем bridge из контекста
  const bridge = useBridge();
  
  const loadElement = (state: ElementState) => {
    if (!state || !state.udtId) return;

    // Если это обновление того же элемента
    if (activeElement.value && activeElement.value.id === state.udtId) {
      activeElement.value.updateFromRemote(state);
      triggerRef(activeElement); // Триггерим реактивность для UI
      return;
    }

    if (!api) {
      console.warn('[useActiveElement] Api required for initialization');
      return;
    }

    // Создаем новый экземпляр модели
    activeElement.value = new TailwindElement(state, bridge, api);
  };

  const clearElement = () => {
    activeElement.value = null;
  };

  return {
    activeElement,
    loadElement,
    clearElement
  };
}
