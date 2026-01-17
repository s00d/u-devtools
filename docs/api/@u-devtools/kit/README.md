[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/kit

# @u-devtools/kit

[![npm version](https://img.shields.io/npm/v/@u-devtools/kit/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/kit)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/kit?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/kit)
[![License](https://img.shields.io/npm/l/@u-devtools/kit?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/kit)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

SDK for creating Universal DevTools plugins. Provides helper functions for plugin development and Web Components adapter to use Vue components from `@u-devtools/ui` in any framework.

## Installation

```bash
npm install -D @u-devtools/kit
```

## Usage

### Creating a Plugin

```ts
import { definePlugin } from '@u-devtools/kit/define-plugin';

export const myPlugin = () => definePlugin({
  name: 'My Plugin',
  root: import.meta.url,
  client: './client',
  app: './app',
  server: './server',
});
```

**Important:** `definePlugin` must be imported from `@u-devtools/kit/define-plugin` (not from `@u-devtools/kit`) because it uses Node.js APIs (`node:url`, `node:path`) and should only be used in server-side code (Vite plugin context).

### Web Components Integration

Use `defineVueElement` to register Vue components as standard Web Components. This allows you to use Vue components from `@u-devtools/ui` in React, Angular, plain HTML, or any other framework.

**Key Features:**
- **Attribute & Property Sync**: Automatically maps HTML attributes to Vue props
- **Complex Data Support**: Use `.props` property for objects/arrays/functions
- **Event Forwarding**: Vue events become standard DOM CustomEvents
- **Slot Bridge**: Initial HTML content becomes Vue default slot
- **Light DOM**: No Shadow DOM, ensuring Tailwind CSS works perfectly

**Registration:**

```typescript
import { defineVueElement } from '@u-devtools/kit';
import { UButton, UCard } from '@u-devtools/ui';

// Register components
defineVueElement('u-button', UButton, {
  attributes: ['label', 'variant', 'icon'],
  emits: ['click']
});

defineVueElement('u-card', UCard, {
  attributes: ['title', 'subtitle']
});
```

**Batch Registration:**

```typescript
import { defineVueElements } from '@u-devtools/kit';

defineVueElements([
  { 
    tagName: 'u-button', 
    component: UButton,
    options: { attributes: ['label'], emits: ['click'] }
  },
  { 
    tagName: 'u-card', 
    component: UCard,
    options: { attributes: ['title'] }
  },
]);
```

**Usage in Plain HTML / CMS / PHP:**

```html
<!-- Props via attributes -->
<u-card title="Web Component Demo">
  <p class="text-gray-400 mb-4">
    This is standard HTML using Vue components via Custom Elements!
  </p>

  <!-- Events via standard listener -->
  <u-button 
    label="Click Me" 
    variant="primary"
    id="my-btn"
  ></u-button>
</u-card>

<script>
  const btn = document.getElementById('my-btn');
  
  // Listen to Vue event as standard DOM event
  btn.addEventListener('click', (e) => {
    console.log('Vue button clicked!', e.detail);
    // Update attribute (reflects to Vue prop)
    btn.setAttribute('label', 'Clicked!');
    btn.setAttribute('variant', 'success');
  });
</script>
```

**Passing Complex Data (JSON/Arrays):**

```html
<u-table id="users-table"></u-table>

<script>
  const table = document.getElementById('users-table');
  
  // Use the .props setter for complex data
  table.props = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'User' }
    ],
    rows: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  };
</script>
```

**Usage in React:**

React passes data to Custom Elements as attributes (strings) by default. For events and complex data, use `useRef` and `.props` setter.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { defineVueElements } from '@u-devtools/kit';
import { UButton, UCard, UInput } from '@u-devtools/ui';

// Register components once
defineVueElements([
  { 
    tagName: 'u-button', 
    component: UButton,
    options: { attributes: ['label', 'variant'], emits: ['click'] }
  },
  { 
    tagName: 'u-card', 
    component: UCard,
    options: { attributes: ['title'] }
  },
  { 
    tagName: 'u-input', 
    component: UInput,
    options: { attributes: ['model-value', 'placeholder'], emits: ['update:modelValue'] }
  },
]);

export const ReactApp = () => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Pass event handlers via .props setter
    if (inputRef.current) {
      (inputRef.current as any).props = {
        onUpdate:modelValue: (value: string) => setText(value)
      };
    }
    if (buttonRef.current) {
      (buttonRef.current as any).props = {
        onClick: () => alert(`Text: ${text}`)
      };
    }
  }, [text]);

  return (
    <div className="p-4">
      <u-card title="React Component">
        <div className="p-4 space-y-4">
          <u-input 
            ref={inputRef} 
            model-value={text} 
            placeholder="Type something..."
          />
          <div>React State: {text}</div>
          <u-button 
            ref={buttonRef}
            label="Submit" 
            variant="primary"
          />
        </div>
      </u-card>
    </div>
  );
};
```

**Usage in Angular:**

Angular has excellent support for Custom Elements. You just need to enable the schema.

**App Module:**

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- Required for custom elements
})
export class AppModule {}
```

**Component:**

```typescript
import { Component } from '@angular/core';
import { defineVueElement } from '@u-devtools/kit';
import { UButton } from '@u-devtools/ui';

defineVueElement('u-button', UButton, { 
  attributes: ['label'], 
  emits: ['click'] 
});

@Component({
  selector: 'app-root',
  template: `
    <u-button 
      [label]="buttonText" 
      (click)="handleClick($event)">
    </u-button>
  `
})
export class AppComponent {
  buttonText = 'Click Me';
  
  handleClick(event: CustomEvent) {
    console.log('Clicked!', event.detail);
  }
}
```

## App Context Plugin Definition

### `defineApp(definition)`

Declaratively defines app-side plugin logic that runs in the main window context.

**Parameters:**
- `definition` (AppPluginDefinition): Plugin definition object

**AppPluginDefinition:**
- `component` (Component | undefined): Optional Vue component to render in overlay layer
- `setup` (function): Setup function that receives `{ bridge, onCleanup }`
- `menu` (object | undefined): Declarative menu item configuration
- `commands` (array | undefined): Declarative command definitions

**Example:**

```ts
import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import type { MyPluginProtocol } from './types';
import MyOverlay from './app/MyOverlay.vue';

export default defineApp({
  // Optional: Vue component rendered in overlay plugins layer
  component: MyOverlay,
  
  // Declarative menu registration
  menu: {
    id: 'my-plugin:quick-action',
    label: 'Quick Action',
    icon: 'Bolt',
    order: 10,
    action: (ctx) => {
      if (!ctx.isOpen) {
        ctx.open();
      }
      ctx.switchPlugin('My Plugin');
    },
  },
  
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<MyPluginProtocol>;
    
    // Bridge is automatically created and managed by overlay
    typedBridge.send('plugin-ready', { message: 'Hello from app context' });
    
    typedBridge.on('action', (data) => {
      // data is automatically typed based on Protocol
      console.log('Action received:', data);
    });

    // Register cleanup function
    // Bridge is automatically closed by overlay
    onCleanup(() => {
      // Remove event listeners, restore patches, etc.
      console.log('Plugin cleanup');
    });
  },
});
```

**Key Benefits:**
- Automatic `AppBridge` lifecycle management
- Built-in HMR cleanup support via `onCleanup`
- Declarative component rendering in overlay
- Declarative menu and command registration
- Fully typed RPC communication via Protocol
- No manual `import.meta.hot` handling required

## Plugin Context

### Module Scope Singleton Pattern

Each plugin has its own isolated context using the Module Scope Singleton pattern. This works everywhere: Vue, React, Svelte, Solid, Vanilla JS, and Node.js.

**Key Benefits:**
- ✅ Zero Dependencies: Core context is pure JavaScript, no Vue or React required
- ✅ Universal: Works in any framework or vanilla JavaScript
- ✅ No Boilerplate: No need for `<Context.Provider>` components
- ✅ No Prop Drilling: Context is available in any file via import
- ✅ Isolation: Each plugin has its own closed context

### Setup

**1. Create context.ts in your plugin:**

```ts
// src/context.ts
import { createDevToolsContext } from '@u-devtools/kit';
import type { AppBridge, ClientApi } from '@u-devtools/core';
import type { MyPluginProtocol } from './types';
import type { Toast } from '@u-devtools/kit';
import { createToast } from '@u-devtools/overlay';

// 1. Create "raw" context
const { setupDevTools, useBridge: useRawBridge, useToast: useRawToast, useApi: useRawApi } = createDevToolsContext();

// 2. Export setup (used in client.ts and app.ts)
export { setupDevTools };

// 3. Export separate typed hooks
export function useBridge(): AppBridge<MyPluginProtocol> {
  return useRawBridge() as AppBridge<MyPluginProtocol>;
}

export function useToast(): Toast {
  return useRawToast();
}

export function useApi(): ClientApi {
  const api = useRawApi();
  if (!api) {
    throw new Error('[u-devtools] API not available in my-plugin context');
  }
  return api;
}
```

**2. Initialize in client.ts:**

```ts
// src/client.ts
import { AppBridge } from '@u-devtools/core';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';

renderMain(container, api) {
  const bridge = new AppBridge('my-plugin');
  
  // Initialize context (once!)
  setupDevTools({ api, bridge, toast: createToast() });
  
  // ... render UI
}
```

**3. Initialize in app.ts (for app context):**

```ts
// src/app.ts
import { defineApp } from '@u-devtools/kit';
import { setupDevTools } from './context';

export default defineApp({
  setup({ bridge, onCleanup }) {
    // Initialize context (api is not available in app context)
    setupDevTools({ bridge });
    
    // ... setup logic
  },
});
```

**4. Use in components:**

```ts
// In any component or composable
import { useBridge, useApi, useToast } from './context';

// Use separate hooks - import only what you need
const bridge = useBridge();
const api = useApi();
const toast = useToast();

// Use anywhere, no prop drilling needed
bridge.send('event', { data: 'test' });
toast.success('Done!');
api.storage.set('key', 'value');
```

## Framework Adapters

### Vue Adapter

### `useBridgeState<T>(syncedState: SyncedState<T>): Ref<T>`

Vue adapter for `SyncedState` that converts it to a Vue ref with bidirectional synchronization.

**Import:**
```ts
import { useBridgeState } from '@u-devtools/kit/vue';
```

**Example:**

```ts
import { useBridgeState } from '@u-devtools/kit/vue';
import { useBridge } from './context';

const bridge = useBridge();
const isOpen = bridge.state('isOpen', false);

// Convert to Vue ref
const isOpenRef = useBridgeState(isOpen);

// Use as normal Vue ref
watch(isOpenRef, (val) => {
  console.log('State changed:', val);
});

// Update from Vue
isOpenRef.value = true; // Automatically syncs to App context
```

### React Adapter

### `useBridgeState<T>(syncedState: SyncedState<T>): [T, (value: T) => void]`

React adapter for `SyncedState` that returns a tuple `[value, setValue]` compatible with React state.

**Import:**
```ts
import { useBridgeState } from '@u-devtools/kit/react';
```

**Example:**

```tsx
import { useBridgeState } from '@u-devtools/kit/react';
import { useBridge } from './context';

const bridge = useBridge();
const isOpen = bridge.state('isOpen', false);

// Convert to React state
const [isOpenValue, setIsOpen] = useBridgeState(isOpen);

// Use as normal React state
useEffect(() => {
  console.log('State changed:', isOpenValue);
}, [isOpenValue]);

// Update from React
setIsOpen(true); // Automatically syncs to App context
```

### Solid Adapter

### `useBridgeState<T>(syncedState: SyncedState<T>): [() => T, (value: T) => void]`

Solid adapter for `SyncedState` that returns a Solid signal.

**Import:**
```ts
import { useBridgeState } from '@u-devtools/kit/solid';
```

**Example:**

```ts
import { useBridgeState } from '@u-devtools/kit/solid';
import { useBridge } from './context';

const bridge = useBridge();
const isOpen = bridge.state('isOpen', false);

// Convert to Solid signal
const [isOpenValue, setIsOpen] = useBridgeState(isOpen);

// Use as normal Solid signal
createEffect(() => {
  console.log('State changed:', isOpenValue());
});

// Update from Solid
setIsOpen(true); // Automatically syncs to App context
```

### Svelte Adapter

### `useBridgeState<T>(syncedState: SyncedState<T>): SvelteStore<T>`

Svelte adapter for `SyncedState` that converts it to a Svelte Writable Store compatible with Svelte's store contract.

**Import:**
```ts
import { useBridgeState } from '@u-devtools/kit/svelte';
```

**Example:**

```svelte
<script>
  import { useBridgeState } from '@u-devtools/kit/svelte';
  import { useBridge } from './context';

  const bridge = useBridge();
  const isOpen = bridge.state('isOpen', false);
  const isOpenStore = useBridgeState(isOpen);
</script>

<button on:click={() => $isOpenStore = !$isOpenStore}>
  Is Open: {$isOpenStore}
</button>
```

### Lit Adapter

### `useBridgeState<T>(host: ReactiveControllerHost, syncedState: SyncedState<T>): BridgeStateController<T>`

Lit adapter for `SyncedState` that works as a Reactive Controller. Automatically calls `requestUpdate()` when state changes.

**Import:**
```ts
import { useBridgeState } from '@u-devtools/kit/lit';
```

**Example:**

```ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useBridgeState } from '@u-devtools/kit/lit';
import { useBridge } from './context';

@customElement('my-element')
export class MyElement extends LitElement {
  private bridge = useBridge();
  private isOpen = useBridgeState(this, this.bridge.state('isOpen', false));

  render() {
    return html`
      <button @click=${() => this.isOpen.value = !this.isOpen.value}>
        Is Open: ${this.isOpen.value}
      </button>
    `;
  }
}
```

### Vanilla JavaScript Adapter

Vanilla adapter provides DOM binding utilities and reactive state management without any framework.

**Import:**
```ts
import { bindText, bindInput, bindClass, bindVisible, bindAttr, bindStyle, bindHtml, useBridgeState } from '@u-devtools/kit/vanilla';
```

**Available Bindings:**
- `bindText(element, state)` - Binds text content
- `bindHtml(element, state)` - Binds HTML content
- `bindClass(element, state, className)` - Toggles CSS class
- `bindVisible(element, state)` - Controls visibility (display: none)
- `bindAttr(element, state, attrName)` - Binds HTML attribute
- `bindInput(element, state)` - Two-way binding for inputs
- `bindStyle(element, state, property)` - Binds CSS style property

**useBridgeState for Vanilla:**
- `useBridgeState(state, onChange?)` - Creates reactive reference with optional effect callback

**Example:**

```ts
import { setupDevTools, useBridge } from './context';
import { bindText, bindInput, bindClass } from '@u-devtools/kit/vanilla';
import { AppBridge } from '@u-devtools/core';

const plugin = {
  renderMain(container, api) {
    const bridge = new AppBridge('vanilla');
    setupDevTools({ api, bridge });
    
    // Now you can use useBridge() anywhere in this context

    // Create reactive states
    const counter = bridge.state('counter', 0);
    const userName = bridge.state('user', 'Guest');
    const isDark = bridge.state('isDark', false);

    // Create markup
    container.innerHTML = `
      <div class="p-4">
        <span id="count-display"></span>
        <input id="name-input" />
        <button id="toggle-theme">Toggle</button>
      </div>
    `;

    // Bind states to DOM
    const disposables = [
      bindText(container.querySelector('#count-display')!, counter),
      bindInput(container.querySelector('#name-input')!, userName),
      bindClass(container as HTMLElement, isDark, 'dark-theme'),
    ];

    // Alternative: use useBridgeState with effect
    const countRef = useBridgeState(counter, (val) => {
      container.querySelector('#count-display')!.textContent = String(val);
    });

    // Event handlers
    container.querySelector('#toggle-theme')!.onclick = () => {
      isDark.value = !isDark.value;
    };
    container.querySelector('#btn-inc')!.onclick = () => {
      countRef.value++; // Updates both local and bridge state
    };

    // Cleanup
    return () => {
      disposables.forEach(fn => fn());
      countRef.dispose();
      bridge.close();
    };
  }
};
```

**Benefits:**
- ✅ Pure JavaScript - no framework dependencies
- ✅ Reactive - DOM updates automatically when state changes
- ✅ Two-way binding - input changes sync to state
- ✅ Automatic cleanup - all bindings return cleanup functions

## Toast Notifications

Toast is automatically included in the context. Access it via `useToast()`:

**Example:**

```ts
import { useToast } from './context';

const toast = useToast();

// Show notifications
toast.success('Operation completed!');
toast.error('Something went wrong');
toast.info('Processing...');
```

**Features:**
- Automatically detects context (iframe or overlay)
- Uses `postMessage` for cross-iframe communication
- Direct rendering in overlay context
- Consistent API across all contexts

## API Reference

### `definePlugin(options)`

Creates a DevTools plugin definition.

**⚠️ Important:** `definePlugin` must be imported from `@u-devtools/kit/define-plugin` (not from `@u-devtools/kit`) because it uses Node.js APIs (`node:url`, `node:path`) and should only be used in server-side code (Vite plugin context).

**Import:**
```ts
import { definePlugin } from '@u-devtools/kit/define-plugin';
```

**Why separate import?**
- `definePlugin` uses Node.js APIs (`node:url`, `node:path`) that cannot be bundled in browser code
- By importing from `@u-devtools/kit/define-plugin`, you ensure it's only used server-side
- The main `@u-devtools/kit` package is browser-safe and doesn't include Node.js dependencies

**Options:**
- `name` (string): Plugin name
- `root` (string): Must pass `import.meta.url` for path resolution
- `client` (string | null): Relative path to client file (default: `'./client'`)
- `app` (string | null): Relative path to app file
- `server` (string | null): Relative path to server file (default: `'./server'`)
- `useDist` (boolean): Force use production paths even in dev mode

### `defineVueElement(tagName, VueComponent, options)`

Registers a Vue component as a Web Component.

**Parameters:**
- `tagName` (string): Custom element tag name (must contain a hyphen)
- `VueComponent` (Component): Vue component from `@u-devtools/ui`
- `options` (DefineElementOptions): Configuration options

**Options:**
- `attributes` (string[]): List of HTML attributes to observe and sync with Vue props
- `emits` (string[]): List of Vue events to forward as DOM CustomEvents

### `defineVueElements(definitions)`

Batch registration helper for multiple components.

**Parameters:**
- `definitions` (Array): Array of `{ tagName, component, options }` objects

## Examples

See the `plugins/react-test` plugin for a complete React integration example.

## Modules

- [](README.md)
- [context](context/README.md)
- [define-plugin](define-plugin/README.md)
- [lit](lit/README.md)
- [react](react/README.md)
- [solid](solid/README.md)
- [svelte](svelte/README.md)
- [vanilla](vanilla/README.md)
- [vue](vue/README.md)
- [web-components](web-components/README.md)
