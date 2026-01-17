[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [web-components](../README.md) / defineVueElement

# Function: defineVueElement()

> **defineVueElement**(`tagName`, `VueComponent`, `options`): `void`

Defined in: [web-components.ts:184](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/web-components.ts#L184)

Registers a Vue component as a standard Web Component (Custom Element).
This allows the component to be used in React, Angular, CMSs, or plain HTML.

Key Features:
- Attribute & Property Sync: Automatically maps HTML attributes to Vue props
- Complex Data Support: Use `.props` property for objects/arrays/functions
- Event Forwarding: Vue events become standard DOM CustomEvents
- Slot Bridge: Initial HTML content becomes Vue default slot
- Light DOM: No Shadow DOM, ensuring Tailwind CSS works perfectly

## Parameters

| Parameter | Type |
| ------ | ------ |
| `tagName` | `string` |
| `VueComponent` | `Component` |
| `options` | [`DefineElementOptions`](../interfaces/DefineElementOptions.md) |

## Returns

`void`

## Examples

```typescript
import { defineVueElement } from '@u-devtools/kit/web-components';
import { UButton } from '@u-devtools/ui';

// Define a Vue component as a Web Component
defineVueElement('u-button', UButton, {
  attributes: ['label', 'variant', 'icon', 'disabled'],
  emits: ['click', 'update:modelValue'],
});

// Now you can use it in HTML
// <u-button label="Click Me" variant="primary"></u-button>

// Or in React
// <u-button label="Click Me" variant="primary" />

// Example: Using props property for complex data
const button = document.querySelector('u-button') as any;
button.props = {
  onClick: () => console.log('Clicked!'),
  customData: { id: 1, name: 'test' },
};

// Example: Listening to events
button.addEventListener('click', (e: CustomEvent) => {
  console.log('Button clicked:', e.detail);
});
```

```ts
import { defineVueElement } from '@u-devtools/kit';
import { UButton } from '@u-devtools/ui';

defineVueElement('u-button', UButton, {
  attributes: ['label', 'variant', 'icon'],
  emits: ['click']
});
```

```html
<u-button label="Click Me" variant="primary"></u-button>

<script>
  const btn = document.querySelector('u-button');
  btn.addEventListener('click', (e) => console.log('Clicked!', e.detail));
  btn.props = { onClick: () => console.log('Programmatic handler') };
</script>
```
