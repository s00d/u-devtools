---
to: <%= projectName %>/src/ui/SveltePanel.svelte
---
<script lang="ts">
  import { useApi } from '../context';
  import BasicComponents from '../views/BasicComponents.svelte';
  import LayoutComponents from '../views/LayoutComponents.svelte';
  import DataDisplay from '../views/DataDisplay.svelte';
  import StateComponents from '../views/StateComponents.svelte';
  import Forms from '../views/Forms.svelte';

  const api = useApi();

  const TAB_ITEMS = ['Basic', 'Layout', 'Data', 'State', 'Forms'];
  let activeTab = $state('Basic');

  let tabsElement: HTMLElement | null = $state(null);
  let resetButtonElement: HTMLElement | null = $state(null);

  // Setup tabs props
  $effect(() => {
    if (tabsElement) {
      (tabsElement as any).props = {
        items: TAB_ITEMS,
        modelValue: activeTab,
        maxVisible: 5,
        'onUpdate:modelValue': (val: string) => {
          activeTab = val;
        },
      };
    }
  });

  // Setup reset button props
  $effect(() => {
    if (resetButtonElement) {
      (resetButtonElement as any).props = {
        onClick: () => {
          activeTab = 'Basic';
        },
      };
    }
  });

</script>

<div class="h-full flex flex-col bg-gray-900 text-gray-200">
  <!-- Toolbar -->
  <div class="border-b border-gray-800 bg-gray-800">
    <div class="p-3 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h2 class="font-bold text-white flex items-center gap-2">
          <u-icon name="CodeBracket" class="w-5 h-5"></u-icon>
          <%= pluginName %>
        </h2>
        <div class="flex items-center gap-2">
          <div class="h-4 w-px bg-gray-700"></div>
          <u-tabs bind:this={tabsElement}></u-tabs>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <u-button
          bind:this={resetButtonElement}
          label="Reset"
          variant="ghost"
          size="sm"
          icon="ArrowPath"
        ></u-button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-auto p-6">
    {#if activeTab === 'Basic'}
      <BasicComponents />
    {:else if activeTab === 'Layout'}
      <LayoutComponents />
    {:else if activeTab === 'Data'}
      <DataDisplay />
    {:else if activeTab === 'State'}
      <StateComponents />
    {:else if activeTab === 'Forms'}
      <Forms />
    {:else}
      <BasicComponents />
    {/if}
  </div>
</div>
