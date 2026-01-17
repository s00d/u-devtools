---
to: <%= projectName %>/src/views/LayoutComponents.svelte
---
<script lang="ts">
  let activeTab = $state('Tab 1');
  let activeTabButton = $state('Button 1');
  let isModalOpen = $state(false);

  let tabsElement: HTMLElement | null = $state(null);
  let tabButtonsElement: HTMLElement | null = $state(null);
  let modalElement: HTMLElement | null = $state(null);

  // Setup tabs props
  $effect(() => {
    if (tabsElement) {
      (tabsElement as any).props = {
        items: ['Tab 1', 'Tab 2', 'Tab 3'],
        modelValue: activeTab,
        'onUpdate:modelValue': (val: string) => {
          activeTab = val;
        },
      };
    }
  });

  // Setup tab buttons props
  $effect(() => {
    if (tabButtonsElement) {
      (tabButtonsElement as any).props = {
        items: ['Button 1', 'Button 2', 'Button 3'],
        modelValue: activeTabButton,
        'onUpdate:modelValue': (val: string) => {
          activeTabButton = val;
        },
      };
    }
  });

  // Setup modal props
  $effect(() => {
    if (modalElement) {
      (modalElement as any).props = {
        visible: isModalOpen,
        onClose: () => {
          isModalOpen = false;
        },
        title: 'Modal Title',
      };
    }
  });
</script>

<div class="space-y-6">
  <u-card title="UTabs - Tab Navigation">
    <div class="p-4 space-y-4">
      <u-tabs bind:this={tabsElement}></u-tabs>
      <div class="p-4 bg-gray-800 rounded">
        <p class="text-sm text-gray-400">Active tab: {activeTab}</p>
      </div>
    </div>
  </u-card>

  <u-card title="UTabButtons - Button Tabs">
    <div class="p-4 space-y-4">
      <u-tab-buttons bind:this={tabButtonsElement}></u-tab-buttons>
      <div class="p-4 bg-gray-800 rounded">
        <p class="text-sm text-gray-400">Active button: {activeTabButton}</p>
      </div>
    </div>
  </u-card>

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

  <u-card title="UModal - Modal Dialog">
    <div class="p-4 space-y-4">
      <button
        type="button"
        onclick={() => (isModalOpen = true)}
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Open Modal
      </button>
      <u-modal bind:this={modalElement}>
        <div class="p-4">
          <p class="text-sm text-gray-300 mb-4">This is modal content</p>
          <button
            type="button"
            onclick={() => (isModalOpen = false)}
            class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </u-modal>
    </div>
  </u-card>

  <u-card title="USplitter - Resizable Panes">
    <div class="p-4">
      <p class="text-sm text-gray-400 mb-4">
        USplitter requires named slots which are complex to implement with Web Components.
        This is a placeholder for the component.
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

