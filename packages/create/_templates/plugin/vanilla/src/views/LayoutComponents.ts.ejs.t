---
to: <%= projectName %>/src/views/LayoutComponents.ts
---
export function renderLayoutComponents(container: HTMLElement) {
  let activeTab = 'Tab 1';
  let activeTabButton = 'Button 1';
  let isModalOpen = false;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- UTabs Example -->
      <u-card title="UTabs - Tab Navigation">
        <div class="p-4 space-y-4">
          <u-tabs id="tabs-example"></u-tabs>
          <div class="p-4 bg-gray-800 rounded">
            <p id="tabs-display" class="text-sm text-gray-400">Active tab: Tab 1</p>
          </div>
        </div>
      </u-card>

      <!-- UTabButtons Example -->
      <u-card title="UTabButtons - Button Tabs">
        <div class="p-4 space-y-4">
          <u-tab-buttons id="tab-buttons-example"></u-tab-buttons>
          <div class="p-4 bg-gray-800 rounded">
            <p id="tab-buttons-display" class="text-sm text-gray-400">Active button: Button 1</p>
          </div>
        </div>
      </u-card>

      <!-- UCard Examples -->
      <u-card title="UCard - Card Container">
        <div class="p-4 space-y-4">
          <u-card title="Card with Title" subtitle="This is a subtitle">
            <div class="p-4">
              <p class="text-sm text-gray-300">Card content goes here</p>
            </div>
          </u-card>
          <u-card>
            <div class="p-4">
              <p class="text-sm text-gray-300">Card without title</p>
            </div>
          </u-card>
        </div>
      </u-card>

      <!-- UModal Example -->
      <u-card title="UModal - Modal Dialog">
        <div class="p-4 space-y-4">
          <button
            id="open-modal-btn"
            type="button"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Open Modal
          </button>
          <u-modal id="modal-example" title="Modal Title">
            <div class="p-4">
              <p class="text-sm text-gray-300 mb-4">This is modal content</p>
              <button
                id="close-modal-btn"
                type="button"
                class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </u-modal>
        </div>
      </u-card>

      <!-- USplitter Placeholder -->
      <u-card title="USplitter - Resizable Panes">
        <div class="p-4">
          <p class="text-sm text-gray-400 mb-4">
            USplitter requires named slots which are complex to implement with vanilla JS. This is a placeholder.
          </p>
          <div class="h-64 border border-gray-700 rounded flex">
            <div class="w-1/3 bg-gray-800 p-4 border-r border-gray-700">
              <p class="text-sm text-gray-300">Left Pane</p>
            </div>
            <div class="flex-1 bg-gray-900 p-4">
              <p class="text-sm text-gray-300">Right Pane</p>
            </div>
          </div>
        </div>
      </u-card>
    </div>
  `;

  // Setup tabs
  const tabsEl = container.querySelector('#tabs-example') as HTMLElement;
  const tabsDisplay = container.querySelector('#tabs-display') as HTMLElement;

  if (tabsEl) {
    (tabsEl as any).props = {
      items: ['Tab 1', 'Tab 2', 'Tab 3'],
      modelValue: activeTab,
      'onUpdate:modelValue': (val: string) => {
        activeTab = val;
        tabsDisplay.textContent = `Active tab: ${activeTab}`;
        (tabsEl as any).props = { ...(tabsEl as any).props, modelValue: activeTab };
      },
    };
  }

  // Setup tab buttons
  const tabButtonsEl = container.querySelector('#tab-buttons-example') as HTMLElement;
  const tabButtonsDisplay = container.querySelector('#tab-buttons-display') as HTMLElement;

  if (tabButtonsEl) {
    (tabButtonsEl as any).props = {
      items: ['Button 1', 'Button 2', 'Button 3'],
      modelValue: activeTabButton,
      'onUpdate:modelValue': (val: string) => {
        activeTabButton = val;
        tabButtonsDisplay.textContent = `Active button: ${activeTabButton}`;
        (tabButtonsEl as any).props = { ...(tabButtonsEl as any).props, modelValue: activeTabButton };
      },
    };
  }

  // Setup modal
  const modalEl = container.querySelector('#modal-example') as HTMLElement;
  const openModalBtn = container.querySelector('#open-modal-btn');
  const closeModalBtn = container.querySelector('#close-modal-btn');

  if (modalEl) {
    (modalEl as any).props = {
      visible: isModalOpen,
      onClose: () => {
        isModalOpen = false;
        (modalEl as any).props = { ...(modalEl as any).props, visible: isModalOpen };
      },
    };
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', (e: Event) => {
      // Only handle CustomEvent from Vue emit, ignore native DOM events
      if (e instanceof CustomEvent && (e as any)._isVueEvent) {
        isModalOpen = true;
        (modalEl as any).props = { ...(modalEl as any).props, visible: isModalOpen };
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e: Event) => {
      // Only handle CustomEvent from Vue emit, ignore native DOM events
      if (e instanceof CustomEvent && (e as any)._isVueEvent) {
        isModalOpen = false;
        (modalEl as any).props = { ...(modalEl as any).props, visible: isModalOpen };
      }
    });
  }
}

