---
to: <%= projectName %>/src/views/data-display.ts
---
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('data-display')
export class DataDisplay extends LitElement {
  private jsonData = {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001',
    },
    hobbies: ['reading', 'coding', 'gaming'],
  };

  private codeExample = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`;

  private tableData = [
    { id: 1, name: 'Alice', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob', role: 'User', status: 'Active' },
    { id: 3, name: 'Charlie', role: 'User', status: 'Inactive' },
  ];

  private tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  private jsonTreeElement: HTMLElement | null = null;
  private tableElement: HTMLElement | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set props immediately when element is connected to DOM
    // This happens before Vue component mounts (which uses requestAnimationFrame)
    this.jsonTreeElement = this.querySelector('u-json-tree') as HTMLElement;
    this.tableElement = this.querySelector('u-table') as HTMLElement;
    this.updateJsonTreeProps();
    this.updateTableProps();
  }

  protected updated() {
    // Re-query elements in case they were re-rendered
    if (!this.jsonTreeElement) {
      this.jsonTreeElement = this.querySelector('u-json-tree') as HTMLElement;
    }
    if (!this.tableElement) {
      this.tableElement = this.querySelector('u-table') as HTMLElement;
    }
    this.updateJsonTreeProps();
    this.updateTableProps();
  }

  private updateJsonTreeProps() {
    if (this.jsonTreeElement) {
      (this.jsonTreeElement as any).props = {
        data: this.jsonData,
      };
    }
  }

  private updateTableProps() {
    if (this.tableElement) {
      (this.tableElement as any).props = {
        columns: this.tableColumns,
        rows: this.tableData,
      };
    }
  }

  render() {
    return html`
      <div class="space-y-6">
        <u-card title="UCodeBlock - Code Display">
          <div class="p-4">
            <u-code-block code=${this.codeExample} language="typescript"></u-code-block>
          </div>
        </u-card>

        <u-card title="UJsonTree - JSON Viewer">
          <div class="p-4">
            <u-json-tree></u-json-tree>
          </div>
        </u-card>

        <u-card title="UKeyValue - Key-Value Pairs">
          <div class="p-4 space-y-2">
            <u-key-value label="Name" value="John Doe"></u-key-value>
            <u-key-value label="Email" value="john@example.com"></u-key-value>
            <u-key-value label="Status" value="Active"></u-key-value>
          </div>
        </u-card>

        <u-card title="UStat - Statistics">
          <div class="p-4">
            <div class="grid grid-cols-3 gap-4">
              <u-stat label="Users" value="1,234" color="blue"></u-stat>
              <u-stat label="Revenue" value="$5,678" color="green"></u-stat>
              <u-stat label="Errors" value="12" color="red"></u-stat>
            </div>
          </div>
        </u-card>

        <u-card title="UTable - Data Table">
          <div class="p-4">
            <u-table></u-table>
          </div>
        </u-card>

        <u-card title="UVirtualList - Virtual Scrolling">
          <div class="p-4">
            <p class="text-sm text-gray-400 mb-4">
              UVirtualList requires complex props and is best used with direct Vue integration.
              This is a placeholder.
            </p>
            <div class="h-64 border border-gray-700 rounded overflow-auto">
              ${Array.from({ length: 100 }, (_, i) => i + 1).map(
                (itemId) => html`<div class="p-2 border-b border-gray-800">Item ${itemId}</div>`
              )}
            </div>
          </div>
        </u-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-display': DataDisplay;
  }
}

