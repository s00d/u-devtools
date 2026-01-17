---
to: <%= projectName %>/src/views/StateComponents.tsx
---
import { useState } from 'react';

export const StateComponents = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <u-card title="ULoading - Loading States">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Basic Loading</span>
            <u-loading />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-400">With Text</span>
            <u-loading text="Loading data..." />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Interactive Example</span>
            <button
              type="button"
              onClick={handleLoad}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Loading'}
            </button>
            {isLoading && (
              <div className="mt-4">
                <u-loading text="Processing..." />
              </div>
            )}
          </div>
        </div>
      </u-card>

      <u-card title="UEmpty - Empty States">
        <div className="p-4 space-y-4">
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

