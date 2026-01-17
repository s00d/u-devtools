---
to: <%= projectName %>/src/ui/vanilla-panel.ts
---
import type { ClientApi } from '@u-devtools/core';
import { renderBasicComponents } from '../views/BasicComponents';
import { renderLayoutComponents } from '../views/LayoutComponents';
import { renderDataDisplay } from '../views/DataDisplay';
import { renderStateComponents } from '../views/StateComponents';
import { renderForms } from '../views/Forms';

const TAB_ITEMS = ['Basic', 'Layout', 'Data', 'State', 'Forms'];

export function createVanillaPanel(container: HTMLElement, api: ClientApi) {
  // Setup main container
  container.innerHTML = `
    <div class="h-full flex flex-col bg-gray-900 text-gray-200">
      <div class="border-b border-gray-800 bg-gray-800">
        <div class="p-3 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <h2 class="font-bold text-white flex items-center gap-2">
              <u-icon name="CodeBracket" class="w-5 h-5"></u-icon>
              <%= pluginName %>
            </h2>
            <div class="flex items-center gap-2">
              <div class="h-4 w-px bg-gray-700"></div>
              <div id="tabs-container"></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <u-button id="reset-button" label="Reset" variant="ghost" size="sm" icon="ArrowPath"></u-button>
          </div>
        </div>
      </div>
      <div id="content-area" class="flex-1 overflow-auto p-6"></div>
    </div>
  `;

  const tabsContainerEl = container.querySelector('#tabs-container') as HTMLElement;
  const resetButtonEl = container.querySelector('#reset-button') as HTMLElement;
  const contentAreaEl = container.querySelector('#content-area') as HTMLElement;

  // State
  let activeTab = 'Basic';

  // Setup tabs using .props for complex data
  const tabsEl = document.createElement('u-tabs');
  tabsContainerEl.appendChild(tabsEl);
  (tabsEl as any).props = {
    items: TAB_ITEMS,
    modelValue: activeTab,
    maxVisible: 5,
    'onUpdate:modelValue': (val: string) => {
      activeTab = val;
      renderContent();
      (tabsEl as any).props = { ...(tabsEl as any).props, modelValue: activeTab };
    },
  };

  // Setup reset button (only listen to CustomEvent from Vue, not native DOM events)
  resetButtonEl.addEventListener('click', (e: Event) => {
    // Only handle CustomEvent from Vue emit, ignore native DOM events
    if (e instanceof CustomEvent && (e as any)._isVueEvent) {
      activeTab = 'Basic';
      renderContent();
      (tabsEl as any).props = { ...(tabsEl as any).props, modelValue: activeTab };
    }
  });

  // Render content based on active tab
  function renderContent() {
    // Clear content area (this removes all event listeners automatically)
    contentAreaEl.innerHTML = '';

    switch (activeTab) {
      case 'Basic':
        renderBasicComponents(contentAreaEl);
        break;
      case 'Layout':
        renderLayoutComponents(contentAreaEl);
        break;
      case 'Data':
        renderDataDisplay(contentAreaEl);
        break;
      case 'State':
        renderStateComponents(contentAreaEl);
        break;
      case 'Forms':
        renderForms(contentAreaEl);
        break;
      default:
        renderBasicComponents(contentAreaEl);
    }
  }

  // Initial render
  renderContent();

  // Cleanup function
  return () => {
    container.innerHTML = '';
  };
}
