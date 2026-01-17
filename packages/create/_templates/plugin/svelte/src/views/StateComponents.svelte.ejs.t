---
to: <%= projectName %>/src/views/StateComponents.svelte
---
<script lang="ts">
  let isLoading = $state(false);

  function handleLoad() {
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
    }, 2000);
  }
</script>

<div class="space-y-6">
  <u-card title="ULoading - Loading States">
    <div class="p-4 space-y-4">
      <div class="space-y-2">
        <span class="text-sm text-gray-400">Basic Loading</span>
        <u-loading></u-loading>
      </div>
      <div class="space-y-2">
        <span class="text-sm text-gray-400">With Text</span>
        <u-loading text="Loading data..."></u-loading>
      </div>
      <div class="space-y-2">
        <span class="text-sm text-gray-400">Interactive Example</span>
        <button
          type="button"
          onclick={handleLoad}
          disabled={isLoading}
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Start Loading'}
        </button>
        {#if isLoading}
          <div class="mt-4">
            <u-loading text="Processing..."></u-loading>
          </div>
        {/if}
      </div>
    </div>
  </u-card>

  <u-card title="UEmpty - Empty States">
    <div class="p-4 space-y-4">
      <u-empty icon="Inbox" title="No items" description="There are no items to display"></u-empty>
      <u-empty
        icon="MagnifyingGlass"
        title="No results"
        description="Try adjusting your search criteria"
      ></u-empty>
      <u-empty icon="Folder" title="Empty folder" description="This folder is empty"></u-empty>
    </div>
  </u-card>
</div>

