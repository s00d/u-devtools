---
to: <%= projectName %>/src/views/StateComponents.ts
---
export function renderStateComponents(container: HTMLElement) {
  let isLoading = false;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- ULoading Examples -->
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
              id="loading-btn"
              type="button"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              Start Loading
            </button>
            <div id="loading-display" class="mt-4" style="display: none;">
              <u-loading text="Processing..."></u-loading>
            </div>
          </div>
        </div>
      </u-card>

      <!-- UEmpty Examples -->
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
  `;

  // Setup loading button
  const loadingBtn = container.querySelector('#loading-btn') as HTMLButtonElement;
  const loadingDisplay = container.querySelector('#loading-display') as HTMLElement;

  if (loadingBtn) {
    loadingBtn.addEventListener('click', (e: Event) => {
      // Only handle CustomEvent from Vue emit, ignore native DOM events
      if (e instanceof CustomEvent && (e as any)._isVueEvent) {
        isLoading = !isLoading;
        loadingBtn.disabled = isLoading;
        loadingBtn.textContent = isLoading ? 'Loading...' : 'Start Loading';
        loadingDisplay.style.display = isLoading ? 'block' : 'none';
      }
    });
  }
}

