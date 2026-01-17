# UI Components

Universal DevTools Kit includes a comprehensive UI component library built with Vue 3 and Tailwind CSS v4. All components are designed to work seamlessly in the DevTools dark theme.

## Installation

Components are available from the `@u-devtools/ui` package:

```typescript
import { UButton, UCard, UInput } from '@u-devtools/ui';
```

## Basic Usage

```vue
<template>
  <div>
    <UButton label="Click Me" variant="primary" @click="handleClick" />
    <UCard title="My Card">
      <p>Card content</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { UButton, UCard } from '@u-devtools/ui';

const handleClick = () => {
  console.log('Button clicked!');
};
</script>
```

<script setup>
import { ref } from 'vue';

// UButton demo state
const buttonClicks = ref(0);
const isLoading = ref(false);

const handleClick = () => {
  buttonClicks.value++;
};

const handleLoading = async () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};

// UInput demo state
const text = ref('');
const search = ref('');
const url = ref('example');
const amount = ref('100');
const inputValue = ref('');

// UDropdown demo state
const selected = ref('');
const selectedAction = ref('');

const options = [
  { label: 'Edit', value: 'edit', icon: 'Pencil' },
  { label: 'Delete', value: 'delete', icon: 'Trash' },
  { label: 'Share', value: 'share', icon: 'Share' },
  { label: 'Duplicate', value: 'duplicate', icon: 'DocumentDuplicate' },
  { label: 'Disabled', value: 'disabled', disabled: true },
];

const actionOptions = [
  { label: 'Save', value: 'save', icon: 'Check' },
  { label: 'Cancel', value: 'cancel', icon: 'XMark' },
  { label: 'Delete', value: 'delete', icon: 'Trash' },
];

// UBadge demo state
const count = ref(42);

// UTabs demo state
const activeTab = ref('Overview');
const tabs = ['Overview', 'Settings', 'Advanced', 'Help', 'About', 'Contact'];

// UTreeView demo state
const selectedNode = ref(null);
const clickedNode = ref(null);

const treeData = ref([
  {
    id: '1',
    label: 'src',
    icon: 'Folder',
    children: [
      { id: '1-1', label: 'components', icon: 'Folder', children: [
        { id: '1-1-1', label: 'Button.vue', icon: 'Document' },
        { id: '1-1-2', label: 'Card.vue', icon: 'Document' },
      ]},
      { id: '1-2', label: 'utils.ts', icon: 'Document' },
      { id: '1-3', label: 'main.ts', icon: 'Document' },
    ],
  },
  {
    id: '2',
    label: 'public',
    icon: 'Folder',
    children: [
      { id: '2-1', label: 'index.html', icon: 'Document' },
      { id: '2-2', label: 'favicon.ico', icon: 'Document' },
    ],
  },
  {
    id: '3',
    label: 'package.json',
    icon: 'Document',
  },
]);

const handleNodeClick = (node) => {
  clickedNode.value = node.label;
};

const handleNodeSelect = (node) => {
  selectedNode.value = node.label;
};

// UModal demo state
const showModal = ref(false);
const showSmallModal = ref(false);
const showLargeModal = ref(false);
</script>

---

## Buttons

### UButton

A versatile button component with multiple variants and sizes.

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` - Button style
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Button size (default: `'md'`)
- `icon?: string` - Heroicons icon name
- `loading?: boolean` - Show loading spinner
- `label?: string` - Button text (alternative to slot)
- `text?: string` - Alias for label

**Events:**
- `@click` - Click event

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Variants</h4>
    <div class="flex gap-2 flex-wrap">
      <UButton label="Primary" variant="primary" @click="handleClick" />
      <UButton label="Secondary" variant="secondary" @click="handleClick" />
      <UButton label="Ghost" variant="ghost" @click="handleClick" />
      <UButton label="Danger" variant="danger" @click="handleClick" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">With Icons</h4>
    <div class="flex gap-2 flex-wrap">
      <UButton label="Save" variant="primary" icon="Check" @click="handleClick" />
      <UButton label="Delete" variant="danger" icon="Trash" @click="handleClick" />
      <UButton label="Edit" variant="secondary" icon="Pencil" @click="handleClick" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Sizes</h4>
    <div class="flex gap-2 flex-wrap items-center">
      <UButton label="XS" size="xs" @click="handleClick" />
      <UButton label="SM" size="sm" @click="handleClick" />
      <UButton label="MD" size="md" @click="handleClick" />
      <UButton label="LG" size="lg" @click="handleClick" />
      <UButton label="XL" size="xl" @click="handleClick" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Loading State</h4>
    <div class="flex gap-2 flex-wrap">
      <UButton 
        label="Click to Load" 
        variant="primary" 
        :loading="isLoading"
        @click="handleLoading"
      />
      <UButton label="Always Loading" variant="primary" :loading="true" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Interactive Counter</h4>
    <div class="flex gap-2 items-center">
      <UButton label="Click Me" variant="primary" @click="handleClick" />
      <span class="text-gray-300">Clicked: {{ buttonClicks }} times</span>
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <div class="flex gap-2 flex-wrap">
    <UButton label="Primary" variant="primary" @click="handleClick" />
    <UButton label="Save" variant="primary" icon="Check" />
    <UButton label="Loading" variant="primary" :loading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UButton } from '@u-devtools/ui';

const isLoading = ref(false);
const handleClick = () => console.log('Clicked!');
</script>
```

---

## Form Inputs

### UInput

Text input with support for prefixes, suffixes, and icons.

**Props:**
- `modelValue?: string | number` - v-model value
- `placeholder?: string` - Placeholder text
- `type?: string` - Input type (default: `'text'`)
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Input size (default: `'md'`)
- `disabled?: boolean` - Disable input
- `readonly?: boolean` - Read-only mode
- `prefix?: string` - Text prefix
- `suffix?: string` - Text suffix
- `prefixIcon?: string` - Heroicons icon name for prefix
- `suffixIcon?: string` - Heroicons icon name for suffix
- `prepend?: string` - External text before input
- `append?: string` - External text after input

**Events:**
- `@update:modelValue` - v-model update
- `@focus` - Focus event
- `@blur` - Blur event
- `@keydown` - Keydown event
- `@keyup` - Keyup event
- `@enter` - Enter key pressed

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Basic Input</h4>
    <UInput v-model="inputValue" placeholder="Type something..." />
    <p class="text-xs text-gray-500 mt-1">Value: {{ inputValue || '(empty)' }}</p>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">With Icon</h4>
    <UInput 
      v-model="search" 
      placeholder="Search..." 
      prefix-icon="MagnifyingGlass" 
    />
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">With Prefix/Suffix</h4>
    <UInput 
      v-model="url" 
      prefix="https://" 
      suffix=".com" 
    />
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Sizes</h4>
    <div class="space-y-2">
      <UInput v-model="text" size="xs" placeholder="Extra small" />
      <UInput v-model="text" size="sm" placeholder="Small" />
      <UInput v-model="text" size="md" placeholder="Medium" />
      <UInput v-model="text" size="lg" placeholder="Large" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">States</h4>
    <div class="space-y-2">
      <UInput v-model="text" placeholder="Normal input" />
      <UInput v-model="text" disabled placeholder="Disabled input" />
      <UInput v-model="text" readonly value="Read-only value" />
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <UInput 
    v-model="value" 
    placeholder="Enter text"
    prefix-icon="MagnifyingGlass"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UInput } from '@u-devtools/ui';

const value = ref('');
</script>
```

### UTextarea

Multi-line text input.

**Props:**
- `modelValue?: string` - v-model value
- `placeholder?: string` - Placeholder text
- `rows?: number` - Number of rows
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Textarea size
- `disabled?: boolean` - Disable textarea
- `readonly?: boolean` - Read-only mode

**Example:**

```vue
<template>
  <UTextarea 
    v-model="description" 
    placeholder="Enter description..."
    :rows="4"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UTextarea } from '@u-devtools/ui';

const description = ref('');
</script>
```

### USelect

Dropdown select input.

**Props:**
- `modelValue?: string | number` - v-model value
- `options?: Array<{ label: string; value: string | number }>` - Select options
- `placeholder?: string` - Placeholder text
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Select size
- `disabled?: boolean` - Disable select

**Example:**

```vue
<template>
  <USelect 
    v-model="selected" 
    :options="options"
    placeholder="Select an option"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { USelect } from '@u-devtools/ui';

const selected = ref('');
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];
</script>
```

### UDropdown

Advanced dropdown with custom options and icons.

**Props:**
- `modelValue?: string` - Selected value
- `options?: DropdownOption[]` - Dropdown options
- `placeholder?: string` - Placeholder text
- `size?: 'xs' | 'sm' | 'md'` - Dropdown size
- `disabled?: boolean` - Disable dropdown
- `trigger?: 'button' | 'custom'` - Trigger type

**Type:**
```typescript
interface DropdownOption {
  label: string;
  value: string;
  icon?: string; // Heroicons icon name
  disabled?: boolean;
}
```

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Basic Dropdown</h4>
    <UDropdown 
      v-model="selected" 
      :options="options"
      placeholder="Select an action..."
    />
    <p class="text-xs text-gray-500 mt-1">Selected: {{ selected || '(none)' }}</p>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Sizes</h4>
    <div class="flex gap-2 items-center">
      <UDropdown v-model="selectedAction" :options="actionOptions" size="xs" placeholder="XS" />
      <UDropdown v-model="selectedAction" :options="actionOptions" size="sm" placeholder="SM" />
      <UDropdown v-model="selectedAction" :options="actionOptions" size="md" placeholder="MD" />
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <UDropdown 
    v-model="selected" 
    :options="options"
    placeholder="Select..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UDropdown } from '@u-devtools/ui';
import type { DropdownOption } from '@u-devtools/ui';

const selected = ref('');
const options: DropdownOption[] = [
  { label: 'Edit', value: 'edit', icon: 'Pencil' },
  { label: 'Delete', value: 'delete', icon: 'Trash' },
];
</script>
```

### UArrayInput

Input for array values (comma-separated or JSON).

**Props:**
- `modelValue?: string[]` - v-model array value
- `separator?: string` - Separator character (default: `','`)
- `placeholder?: string` - Placeholder text

**Example:**

```vue
<template>
  <UArrayInput 
    v-model="tags" 
    placeholder="Enter tags (comma-separated)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UArrayInput } from '@u-devtools/ui';

const tags = ref(['vue', 'typescript', 'devtools']);
</script>
```

### UForm

Form container with validation support.

**Props:**
- `modelValue?: Record<string, any>` - Form data object
- `schema?: FormSchema` - Form validation schema

**Example:**

```vue
<template>
  <UForm v-model="formData" :schema="schema">
    <UInput v-model="formData.name" label="Name" />
    <UInput v-model="formData.email" label="Email" type="email" />
    <UButton label="Submit" @click="handleSubmit" />
  </UForm>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UForm, UInput, UButton } from '@u-devtools/ui';

const formData = ref({
  name: '',
  email: '',
});

const schema = {
  name: { required: true },
  email: { required: true, type: 'email' },
};

const handleSubmit = () => {
  console.log('Form submitted:', formData.value);
};
</script>
```

---

## Data Display

### UCard

Card container for grouping content.

**Props:**
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `padding?: boolean` - Enable padding (default: `true`)
- `hover?: boolean` - Enable hover effect

**Slots:**
- `default` - Card content
- `footer` - Footer content

**Live Demo:**

<div class="my-6 space-y-4">
  <UCard title="Basic Card" subtitle="This is a card with title and subtitle">
    <p class="text-gray-300">Card content goes here. You can put any content inside.</p>
  </UCard>

  <UCard title="Card with Footer" hover>
    <p class="text-gray-300">This card has a footer with action buttons.</p>
    <template #footer>
      <div class="flex gap-2">
        <UButton label="Save" variant="primary" size="sm" />
        <UButton label="Cancel" variant="secondary" size="sm" />
      </div>
    </template>
  </UCard>

  <UCard title="Card without Padding" :padding="false">
    <div class="p-4 bg-zinc-900/50">
      <p class="text-gray-300">Custom padding applied to inner content.</p>
    </div>
  </UCard>
</div>

**Code Example:**

```vue
<template>
  <UCard title="Card Title" subtitle="Card subtitle">
    <p>Card content goes here.</p>
    <template #footer>
      <UButton label="Save" variant="primary" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { UCard, UButton } from '@u-devtools/ui';
</script>
```

### UBadge

Badge component for labels and status indicators.

**Props:**
- `color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue'` - Badge color
- `size?: 'xs' | 'sm' | 'md'` - Badge size
- `label?: string | number` - Badge text (alternative to slot)

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Colors</h4>
    <div class="flex gap-2 flex-wrap">
      <UBadge label="Default" />
      <UBadge label="Success" color="green" />
      <UBadge label="Warning" color="yellow" />
      <UBadge label="Error" color="red" />
      <UBadge label="Info" color="blue" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Sizes</h4>
    <div class="flex gap-2 flex-wrap items-center">
      <UBadge label="XS" size="xs" />
      <UBadge label="SM" size="sm" />
      <UBadge label="MD" size="md" />
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">With Numbers</h4>
    <div class="flex gap-2 flex-wrap">
      <UBadge :label="count" color="green" />
      <UBadge label="99+" color="red" />
      <UBadge label="New" color="blue" />
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <UBadge label="Success" color="green" />
  <UBadge :label="count" color="blue" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UBadge } from '@u-devtools/ui';

const count = ref(42);
</script>
```

### UTable

Table component for displaying tabular data.

**Props:**
- `columns?: Array<{ key: string; label: string }>` - Table columns
- `data?: any[]` - Table data
- `striped?: boolean` - Striped rows

**Example:**

```vue
<template>
  <UTable 
    :columns="columns" 
    :data="users"
    striped
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UTable } from '@u-devtools/ui';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];

const users = ref([
  { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]);
</script>
```

### UKeyValue

Display key-value pairs.

**Props:**
- `data?: Record<string, any>` - Key-value data object
- `collapsible?: boolean` - Make nested objects collapsible

**Example:**

```vue
<template>
  <UKeyValue :data="metadata" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UKeyValue } from '@u-devtools/ui';

const metadata = ref({
  name: 'My Plugin',
  version: '1.0.0',
  author: 'John Doe',
  description: 'A sample plugin',
});
</script>
```

### UStat

Statistic display component.

**Props:**
- `label?: string` - Stat label
- `value?: string | number` - Stat value
- `icon?: string` - Heroicons icon name
- `trend?: 'up' | 'down' | 'neutral'` - Trend indicator

**Example:**

```vue
<template>
  <div class="grid grid-cols-3 gap-4">
    <UStat label="Total Users" :value="1234" icon="Users" trend="up" />
    <UStat label="Revenue" value="$12,345" icon="CurrencyDollar" trend="up" />
    <UStat label="Errors" :value="5" icon="ExclamationTriangle" trend="down" />
  </div>
</template>

<script setup lang="ts">
import { UStat } from '@u-devtools/ui';
</script>
```

---

## Navigation & Layout

### UTabs

Tab navigation component.

**Props:**
- `items: string[]` - Array of tab labels
- `modelValue?: string` - Active tab
- `maxVisible?: number` - Maximum visible tabs before showing "More" menu

**Events:**
- `@update:modelValue` - Tab change event

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Basic Tabs</h4>
    <UTabs 
      :items="['Overview', 'Settings', 'Advanced']" 
      v-model="activeTab"
    />
    <div class="mt-4 p-4 bg-zinc-800 rounded">
      <p class="text-gray-300">Active tab: <strong>{{ activeTab }}</strong></p>
    </div>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Many Tabs (with "More" menu)</h4>
    <UTabs 
      :items="tabs" 
      v-model="activeTab"
      :max-visible="3"
    />
  </div>
</div>

**Code Example:**

```vue
<template>
  <UTabs 
    :items="tabs" 
    v-model="activeTab"
    @update:modelValue="handleTabChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UTabs } from '@u-devtools/ui';

const tabs = ['Overview', 'Settings', 'Advanced'];
const activeTab = ref('Overview');
</script>
```

### UTabButtons

Button-style tabs.

**Props:**
- `items: string[]` - Array of tab labels
- `modelValue?: string` - Active tab

**Example:**

```vue
<template>
  <UTabButtons 
    :items="views" 
    v-model="activeView"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UTabButtons } from '@u-devtools/ui';

const views = ['List', 'Grid', 'Details'];
const activeView = ref('List');
</script>
```

### UAccordion

Collapsible accordion component.

**Props:**
- `items: Array<{ title: string; content: string }>` - Accordion items
- `multiple?: boolean` - Allow multiple items open
- `defaultOpen?: string[]` - Default open items

**Example:**

```vue
<template>
  <UAccordion 
    :items="faqItems"
    :multiple="true"
  />
</template>

<script setup lang="ts">
import { UAccordion } from '@u-devtools/ui';

const faqItems = [
  { title: 'What is this?', content: 'This is a DevTools plugin.' },
  { title: 'How to use?', content: 'Follow the documentation.' },
  { title: 'Support?', content: 'Contact us at support@example.com' },
];
</script>
```

### USplitter

Resizable split panel component.

**Props:**
- `direction?: 'horizontal' | 'vertical'` - Split direction
- `sizes?: number[]` - Initial panel sizes (percentages)

**Example:**

```vue
<template>
  <USplitter :sizes="[30, 70]">
    <template #left>
      <div class="p-4">Left panel</div>
    </template>
    <template #right>
      <div class="p-4">Right panel</div>
    </template>
  </USplitter>
</template>

<script setup lang="ts">
import { USplitter } from '@u-devtools/ui';
</script>
```

---

## Trees & Lists

### UTreeView

Tree view component for hierarchical data.

**Props:**
- `nodes: TreeNode[]` - Tree nodes
- `title?: string` - Tree title
- `showHeader?: boolean` - Show header (default: `true`)
- `expandAll?: boolean` - Expand all nodes initially
- `selectable?: boolean` - Allow node selection (default: `true`)
- `indentSize?: number` - Indentation size in pixels (default: `20`)

**Type:**
```typescript
interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  data?: Record<string, unknown>;
  isExpanded?: boolean;
  isSelected?: boolean;
  isCurrent?: boolean;
  icon?: string;
  [key: string]: unknown;
}
```

**Events:**
- `@nodeClick` - Node clicked
- `@nodeSelect` - Node selected
- `@nodeExpand` - Node expanded/collapsed

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">File Tree</h4>
    <UTreeView 
      :nodes="treeData"
      title="File Explorer"
      @nodeClick="handleNodeClick"
      @nodeSelect="handleNodeSelect"
    />
    <div class="mt-2 text-xs text-gray-500">
      <p>Clicked: {{ clickedNode || '(none)' }}</p>
      <p>Selected: {{ selectedNode || '(none)' }}</p>
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <UTreeView 
    :nodes="treeData"
    title="File Explorer"
    @nodeClick="handleNodeClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UTreeView } from '@u-devtools/ui';
import type { TreeNode } from '@u-devtools/ui';

const treeData = ref<TreeNode[]>([
  {
    id: '1',
    label: 'src',
    icon: 'Folder',
    children: [
      { id: '1-1', label: 'components', icon: 'Folder' },
    ],
  },
]);
</script>
```

### UFileTree

Specialized file tree component.

**Props:**
- `nodes: TreeNode[]` - File tree nodes
- `showHeader?: boolean` - Show header

**Example:**

```vue
<template>
  <UFileTree :nodes="fileTree" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UFileTree } from '@u-devtools/ui';
import type { TreeNode } from '@u-devtools/ui';

const fileTree = ref<TreeNode[]>([
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/components', label: 'components' },
      { id: 'src/utils.ts', label: 'utils.ts' },
    ],
  },
]);
</script>
```

### UVirtualList

Virtualized list for large datasets.

**Props:**
- `items: any[]` - List items
- `itemHeight?: number` - Height of each item in pixels
- `height?: number` - Container height

**Slots:**
- `default` - Item template (receives `item` and `index`)

**Example:**

```vue
<template>
  <UVirtualList 
    :items="largeDataset"
    :item-height="50"
    :height="400"
  >
    <template #default="{ item, index }">
      <div class="p-2 border-b border-zinc-800">
        {{ index + 1 }}. {{ item.name }}
      </div>
    </template>
  </UVirtualList>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UVirtualList } from '@u-devtools/ui';

const largeDataset = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
  }))
);
</script>
```

---

## Code & Data

### UCodeBlock

Syntax-highlighted code block.

**Props:**
- `code?: string` - Code content
- `language?: string` - Programming language
- `showLineNumbers?: boolean` - Show line numbers
- `copyable?: boolean` - Show copy button

**Example:**

```vue
<template>
  <UCodeBlock 
    :code="codeExample"
    language="typescript"
    :show-line-numbers="true"
    :copyable="true"
  />
</template>

<script setup lang="ts">
import { UCodeBlock } from '@u-devtools/ui';

const codeExample = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;
</script>
```

### UJsonTree

Interactive JSON tree viewer.

**Props:**
- `data?: any` - JSON data to display
- `expandDepth?: number` - Initial expansion depth
- `selectable?: boolean` - Allow value selection

**Example:**

```vue
<template>
  <UJsonTree 
    :data="jsonData"
    :expand-depth="2"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UJsonTree } from '@u-devtools/ui';

const jsonData = ref({
  name: 'My Plugin',
  version: '1.0.0',
  config: {
    enabled: true,
    options: ['option1', 'option2'],
  },
});
</script>
```

### UDomNode

DOM node inspector component.

**Props:**
- `node?: HTMLElement` - DOM node to inspect
- `showAttributes?: boolean` - Show HTML attributes
- `showStyles?: boolean` - Show computed styles

**Example:**

```vue
<template>
  <UDomNode 
    :node="selectedNode"
    :show-attributes="true"
    :show-styles="true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UDomNode } from '@u-devtools/ui';

const selectedNode = ref<HTMLElement | null>(null);

onMounted(() => {
  selectedNode.value = document.querySelector('.my-element') as HTMLElement;
});
</script>
```

---

## Colors

### UColorPicker

Color picker with Tailwind color support.

**Props:**
- `modelValue?: string` - Selected color (Tailwind class)
- `type?: 'text' | 'bg' | 'border'` - Color type
- `size?: 'xs' | 'sm' | 'md'` - Picker size
- `colors?: ColorOption[]` - Available colors
- `showOpacity?: boolean` - Show opacity selector
- `showNone?: boolean` - Show "None" option

**Type:**
```typescript
interface ColorOption {
  name: string;
  value: string; // Tailwind class
  hex?: string; // Hex color for preview
}
```

**Example:**

```vue
<template>
  <UColorPicker 
    v-model="selectedColor"
    type="bg"
    :colors="colorOptions"
    :show-opacity="true"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UColorPicker } from '@u-devtools/ui';
import type { ColorOption } from '@u-devtools/ui';

const selectedColor = ref('bg-blue-500');
const colorOptions: ColorOption[] = [
  { name: 'Red', value: 'bg-red-500', hex: '#ef4444' },
  { name: 'Blue', value: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Green', value: 'bg-green-500', hex: '#22c55e' },
];
</script>
```

### UColorGrid

Grid display for color options.

**Props:**
- `colors: ColorOption[]` - Color options
- `currentColor?: string | null` - Currently selected color
- `onSelect: (value: string) => void` - Selection handler

**Example:**

```vue
<template>
  <UColorGrid 
    :colors="colors"
    :current-color="selectedColor"
    :on-select="handleColorSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UColorGrid } from '@u-devtools/ui';
import type { ColorOption } from '@u-devtools/ui';

const selectedColor = ref<string | null>(null);
const colors: ColorOption[] = [
  { name: 'Red', value: 'red-500', hex: '#ef4444' },
  { name: 'Blue', value: 'blue-500', hex: '#3b82f6' },
];

const handleColorSelect = (value: string) => {
  selectedColor.value = value;
};
</script>
```

---

## Feedback

### UModal

Modal dialog component.

**Props:**
- `visible: boolean` - Modal visibility
- `title?: string` - Modal title
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size
- `closable?: boolean` - Show close button (default: `true`)

**Events:**
- `@close` - Close event

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Basic Modal</h4>
    <UButton label="Open Modal" variant="primary" @click="showModal = true" />
    
    <UModal 
      v-model:visible="showModal"
      title="Confirm Action"
      size="md"
    >
      <p class="text-gray-300 mb-4">Are you sure you want to proceed with this action?</p>
      
      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton label="Cancel" variant="secondary" @click="showModal = false" />
          <UButton label="Confirm" variant="primary" @click="showModal = false" />
        </div>
      </template>
    </UModal>
  </div>

  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Modal Sizes</h4>
    <div class="flex gap-2">
      <UButton label="Small" variant="secondary" @click="showSmallModal = true" />
      <UButton label="Large" variant="secondary" @click="showLargeModal = true" />
    </div>

    <UModal 
      v-model:visible="showSmallModal"
      title="Small Modal"
      size="sm"
    >
      <p class="text-gray-300">This is a small modal dialog.</p>
    </UModal>

    <UModal 
      v-model:visible="showLargeModal"
      title="Large Modal"
      size="lg"
    >
      <p class="text-gray-300">This is a large modal dialog with more space for content.</p>
    </UModal>
  </div>
</div>

**Code Example:**

```vue
<template>
  <UButton label="Open Modal" @click="showModal = true" />
  
  <UModal 
    v-model:visible="showModal"
    title="Confirm Action"
    size="md"
  >
    <p>Are you sure?</p>
    <template #footer>
      <UButton label="Cancel" @click="showModal = false" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UModal } from '@u-devtools/ui';

const showModal = ref(false);
</script>
```

### ULoading

Loading spinner component.

**Props:**
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Spinner size
- `text?: string` - Loading text

**Live Demo:**

<div class="my-6 space-y-4">
  <div>
    <h4 class="text-sm font-semibold mb-2 text-gray-300">Loading States</h4>
    <div class="space-y-4">
      <div class="p-4 bg-zinc-800 rounded">
        <ULoading text="Loading data..." />
      </div>
      <div class="p-4 bg-zinc-800 rounded">
        <ULoading text="Please wait..." size="lg" />
      </div>
    </div>
  </div>
</div>

**Code Example:**

```vue
<template>
  <ULoading text="Loading data..." />
</template>

<script setup lang="ts">
import { ULoading } from '@u-devtools/ui';
</script>
```

### UEmpty

Empty state component.

**Props:**
- `title?: string` - Empty state title
- `description?: string` - Empty state description
- `icon?: string` - Heroicons icon name

**Live Demo:**

<div class="my-6 space-y-4">
  <div class="p-8 bg-zinc-800 rounded">
    <UEmpty 
      title="No items found"
      description="Try adding some items to get started"
      icon="Inbox"
    />
  </div>
  
  <div class="p-8 bg-zinc-800 rounded">
    <UEmpty 
      title="No data available"
      description="There is nothing to display here"
      icon="DocumentText"
    />
  </div>
</div>

**Code Example:**

```vue
<template>
  <UEmpty 
    title="No items found"
    description="Try adding some items"
    icon="Inbox"
  />
</template>

<script setup lang="ts">
import { UEmpty } from '@u-devtools/ui';
</script>
```

---

## Utilities

### UIcon

Icon component using Heroicons.

**Props:**
- `name: string` - Heroicons icon name
- `size?: string` - Icon size (CSS class, e.g., `'w-4 h-4'`)

**Example:**

```vue
<template>
  <div class="flex gap-2">
    <UIcon name="Home" class="w-5 h-5" />
    <UIcon name="User" class="w-6 h-6" />
    <UIcon name="Settings" class="w-4 h-4" />
  </div>
</template>

<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
</script>
```

### UPluginLayout

Layout component specifically designed for plugin panels.

**Props:**
- `title?: string` - Panel title
- `showHeader?: boolean` - Show header

**Slots:**
- `default` - Main content
- `sidebar` - Sidebar content
- `header` - Custom header

**Example:**

```vue
<template>
  <UPluginLayout title="My Plugin">
    <template #sidebar>
      <div class="p-4">Sidebar content</div>
    </template>
    
    <template #default>
      <div class="p-4">Main content</div>
    </template>
  </UPluginLayout>
</template>

<script setup lang="ts">
import { UPluginLayout } from '@u-devtools/ui';
</script>
```

---

## Complete Example

Here's a complete example combining multiple components:

```vue
<template>
  <UPluginLayout title="User Management">
    <template #sidebar>
      <UTreeView 
        :nodes="menuItems"
        @nodeSelect="handleMenuSelect"
      />
    </template>
    
    <template #default>
      <UCard title="Users" subtitle="Manage your users">
        <div class="space-y-4">
          <!-- Search -->
          <UInput 
            v-model="searchQuery"
            placeholder="Search users..."
            prefix-icon="MagnifyingGlass"
          />
          
          <!-- Actions -->
          <div class="flex gap-2">
            <UButton 
              label="Add User" 
              variant="primary" 
              icon="Plus"
              @click="showAddModal = true"
            />
            <UButton 
              label="Export" 
              variant="secondary" 
              icon="ArrowDownTray"
            />
          </div>
          
          <!-- Table -->
          <UTable 
            :columns="columns"
            :data="filteredUsers"
            striped
          />
        </div>
      </UCard>
      
      <!-- Add User Modal -->
      <UModal 
        v-model:visible="showAddModal"
        title="Add New User"
        size="md"
      >
        <UForm v-model="newUser" :schema="userSchema">
          <UInput v-model="newUser.name" label="Name" />
          <UInput v-model="newUser.email" label="Email" type="email" />
          <USelect 
            v-model="newUser.role" 
            :options="roleOptions"
            label="Role"
          />
        </UForm>
        
        <template #footer>
          <div class="flex gap-2 justify-end">
            <UButton 
              label="Cancel" 
              variant="secondary" 
              @click="showAddModal = false"
            />
            <UButton 
              label="Save" 
              variant="primary" 
              @click="handleSave"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UPluginLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  UPluginLayout,
  UTreeView,
  UCard,
  UInput,
  UButton,
  UTable,
  UModal,
  UForm,
  USelect,
} from '@u-devtools/ui';
import type { TreeNode } from '@u-devtools/ui';

const searchQuery = ref('');
const showAddModal = ref(false);
const newUser = ref({ name: '', email: '', role: '' });

const menuItems: TreeNode[] = [
  { id: 'users', label: 'Users', icon: 'Users' },
  { id: 'roles', label: 'Roles', icon: 'ShieldCheck' },
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];

const users = ref([
  { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const userSchema = {
  name: { required: true },
  email: { required: true, type: 'email' },
  role: { required: true },
};

const handleMenuSelect = (node: TreeNode) => {
  console.log('Menu selected:', node);
};

const handleSave = () => {
  users.value.push({ ...newUser.value });
  newUser.value = { name: '', email: '', role: '' };
  showAddModal.value = false;
};
</script>
```

---

## See Also

- [API Reference](/api/@u-devtools/ui/README) - Complete component API documentation
- [Plugin Development Guide](/guide/plugin-development) - Learn how to build plugins
- [Architecture Guide](/guide/architecture) - Understand the system architecture
