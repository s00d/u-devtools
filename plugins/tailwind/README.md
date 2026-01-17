# @u-devtools/plugin-tailwind

Tailwind Commander - Ultimate IDE for Tailwind CSS styles inside the browser.

## Features

- **Smart Class Editor**: Autocomplete classes based on your `tailwind.config.js`
- **Visual GUI**: Buttons and controls for Flexbox, Grid, Spacing, Typography (no need to remember class names)
- **Conflict Solver**: Automatically detects and removes conflicting classes (e.g., if you add `p-4`, it removes `p-2`)
- **State Management**: Separate editing for modifiers `hover:`, `focus:`, `dark:`, `md:`, `lg:`
- **Config Explorer**: View your entire design system (colors, spacing, fonts) that are actually available in your project
- **Pixel Matcher**: Hover over an element, and the plugin suggests which Tailwind class best describes those computed styles (CSS reversing)

## Installation

```bash
npm install -D @u-devtools/plugin-tailwind
# or
pnpm add -D @u-devtools/plugin-tailwind
# or
yarn add -D @u-devtools/plugin-tailwind
```

## Usage

Add to your `vite.config.ts`:

```ts
import { createDevTools } from '@u-devtools/vite';
import { tailwindPlugin } from '@u-devtools/plugin-tailwind';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        tailwindPlugin(),
      ],
    }),
  ],
});
```

## How It Works

1. **Select an element** using the Inspector plugin
2. **Tailwind Commander** automatically loads the element's classes
3. **Edit styles** using the visual GUI or smart class input
4. **Conflicts are automatically resolved** - old conflicting classes are removed
5. **Changes are applied instantly** to the selected element

## Integration

The plugin integrates with the Inspector plugin:
- When you select an element in Inspector, Tailwind Commander automatically receives the element data
- Both plugins use the same `data-udt-id` attribute for reliable element tracking
- Changes made in Tailwind Commander are immediately reflected in the DOM

