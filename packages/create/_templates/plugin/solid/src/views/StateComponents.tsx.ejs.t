---
to: <%= projectName %>/src/views/StateComponents.tsx
---
import { createSignal } from 'solid-js';

export const StateComponents = () => {
  const [isLoading, setIsLoading] = createSignal(false);

  const handleLoad = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div class="space-y-6">
      <u-card title="ULoading - Loading States">
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <span class="text-sm text-gray-400">Basic Loading</span>
            <u-loading />
          </div>
          <div class="space-y-2">
            <span class="text-sm text-gray-400">With Text</span>
            <u-loading text="Loading data..." />
          </div>
          <div class="space-y-2">
            <span class="text-sm text-gray-400">Interactive Example</span>
            <button
              type="button"
              onClick={handleLoad}
              disabled={isLoading()}
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading() ? 'Loading...' : 'Start Loading'}
            </button>
            {isLoading() && (
              <div class="mt-4">
                <u-loading text="Processing..." />
              </div>
            )}
          </div>
        </div>
      </u-card>

      <u-card title="UEmpty - Empty States">
        <div class="p-4 space-y-4">
          <u-empty icon="Inbox" title="No items" description="There are no items to display" />
          <u-empty
            icon="MagnifyingGlass"
            title="No results"
            description="Try adjusting your search criteria"
          />
          <u-empty icon="Folder" title="Empty folder" description="This folder is empty" />
        </div>
      </u-card>
    </div>
  );
};

