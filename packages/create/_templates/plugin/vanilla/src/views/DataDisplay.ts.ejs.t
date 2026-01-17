---
to: <%= projectName %>/src/views/DataDisplay.ts
---
export function renderDataDisplay(container: HTMLElement) {
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

  container.innerHTML = `
    <div class="space-y-6">
      <!-- UCodeBlock Example -->
      <u-card title="UCodeBlock - Code Display">
        <div class="p-4">
          <u-code-block id="code-block" language="typescript"></u-code-block>
        </div>
      </u-card>

      <!-- UJsonTree Example -->
      <u-card title="UJsonTree - JSON Viewer">
        <div class="p-4">
          <u-json-tree id="json-tree"></u-json-tree>
        </div>
      </u-card>

      <!-- UKeyValue Examples -->
      <u-card title="UKeyValue - Key-Value Pairs">
        <div class="p-4 space-y-2">
          <u-key-value label="Name" value="John Doe"></u-key-value>
          <u-key-value label="Email" value="john@example.com"></u-key-value>
          <u-key-value label="Status" value="Active"></u-key-value>
        </div>
      </u-card>

      <!-- UStat Examples -->
      <u-card title="UStat - Statistics">
        <div class="p-4">
          <div class="grid grid-cols-3 gap-4">
            <u-stat label="Users" value="1,234" color="blue"></u-stat>
            <u-stat label="Revenue" value="$5,678" color="green"></u-stat>
            <u-stat label="Errors" value="12" color="red"></u-stat>
          </div>
        </div>
      </u-card>

      <!-- UTable Example -->
      <u-card title="UTable - Data Table">
        <div class="p-4">
          <u-table id="table-example"></u-table>
        </div>
      </u-card>

      <!-- UVirtualList Placeholder -->
      <u-card title="UVirtualList - Virtual Scrolling">
        <div class="p-4">
          <p class="text-sm text-gray-400 mb-4">
            UVirtualList requires complex props and is best used with direct Vue integration. This is a placeholder.
          </p>
          <div class="h-64 border border-gray-700 rounded overflow-auto">
            ${Array.from({ length: 100 }, (_, i) => {
              const itemId = `virtual-item-${i + 1}`;
              return `<div class="p-2 border-b border-gray-800">Item ${i + 1}</div>`;
            }).join('')}
          </div>
        </div>
      </u-card>
    </div>
  `;

  // Setup code block
  const codeBlockEl = container.querySelector('#code-block') as HTMLElement;
  if (codeBlockEl) {
    (codeBlockEl as any).props = { code: codeExample, language: 'typescript' };
  }

  // Setup JSON tree
  const jsonTreeEl = container.querySelector('#json-tree') as HTMLElement;
  if (jsonTreeEl) {
    (jsonTreeEl as any).props = { data: jsonData };
  }

  // Setup table
  const tableEl = container.querySelector('#table-example') as HTMLElement;
  if (tableEl) {
    (tableEl as any).props = {
      columns: tableColumns,
      rows: tableData,
    };
  }
}

