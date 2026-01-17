---
to: <%= projectName %>/src/views/DataDisplay.tsx
---
import { useVueRef } from '../hooks/useVueRef';

export const DataDisplay = () => {
  const jsonData = {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001',
    },
    hobbies: ['reading', 'coding', 'gaming'],
  };

  const codeExample = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`;

  const tableData = [
    { id: 1, name: 'Alice', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob', role: 'User', status: 'Active' },
    { id: 3, name: 'Charlie', role: 'User', status: 'Inactive' },
  ];

  const tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  // Use useVueRef for complex data (arrays/objects)
  const jsonTreeRef = useVueRef({
    data: jsonData,
  });

  const tableRef = useVueRef({
    columns: tableColumns,
    rows: tableData,
  });

  return (
    <div class="space-y-6">
      <u-card title="UCodeBlock - Code Display">
        <div class="p-4">
          <u-code-block code={codeExample} language="typescript" />
        </div>
      </u-card>

      <u-card title="UJsonTree - JSON Viewer">
        <div class="p-4">
          <u-json-tree ref={jsonTreeRef} />
        </div>
      </u-card>

      <u-card title="UKeyValue - Key-Value Pairs">
        <div class="p-4 space-y-2">
          <u-key-value label="Name" value="John Doe" />
          <u-key-value label="Email" value="john@example.com" />
          <u-key-value label="Status" value="Active" />
        </div>
      </u-card>

      <u-card title="UStat - Statistics">
        <div class="p-4">
          <div class="grid grid-cols-3 gap-4">
            <u-stat label="Users" value="1,234" color="blue" />
            <u-stat label="Revenue" value="$5,678" color="green" />
            <u-stat label="Errors" value="12" color="red" />
          </div>
        </div>
      </u-card>

      <u-card title="UTable - Data Table">
        <div class="p-4">
          <u-table ref={tableRef} />
        </div>
      </u-card>

      <u-card title="UVirtualList - Virtual Scrolling">
        <div class="p-4">
          <p class="text-sm text-gray-400 mb-4">
            UVirtualList requires complex props and is best used with direct Vue integration.
            This is a placeholder.
          </p>
          <div class="h-64 border border-gray-700 rounded overflow-auto">
            {Array.from({ length: 100 }, (_, i) => {
              return (
                <div class="p-2 border-b border-gray-800">
                  Item {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </u-card>
    </div>
  );
};

