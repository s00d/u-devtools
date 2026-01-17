# @u-devtools/plugin-componentsbook

Interactive component development and documentation plugin for Universal DevTools. Create component stories alongside your Vue components and interact with them directly in the DevTools panel.

## Features

- **Zero Configuration**: No need to register stories in config files. Just create `.stories.vue` files next to your components
- **Auto Analysis**: Automatically extracts props, events, and slots from your components using `vue-docgen-api`
- **Interactive Controls**: Live prop editing with automatic UI generation based on prop types (text, number, checkbox, select, JSON)
- **Three Preview Modes**: Stories, Playground, and Matrix views for different use cases
- **Real-time Updates**: Hot Module Replacement (HMR) support - changes to story files update instantly
- **Isolated Rendering**: Stories render in an isolated overlay layer, but have access to your app's context (Pinia, Router, etc.)
- **Full Documentation**: View comprehensive documentation tables for props, events, and slots
- **Code Generation**: See generated Vue code for your component usage with freeze/copy functionality
- **Canvas Tools**: Viewport controls, zoom, background options (grid, light, dark, transparent)

## Installation

```bash
pnpm add -D @u-devtools/plugin-componentsbook
```

## Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { componentsbookPlugin } from '@u-devtools/plugin-componentsbook';

export default defineConfig({
  plugins: [
    componentsbookPlugin(),
    // ... other plugins
  ],
});
```

## File Structure

The plugin works on the principle of co-location. Story files should be placed next to their components with the `.stories.vue` suffix.

```
src/
  components/
    Button/
      Button.vue         ← Your component
      Button.stories.vue ← Story for DevTools
    Card.vue
    Card.stories.vue
```

## Creating Stories

### Basic Story Structure

A story file is a regular Vue component that exports your component as the default export:

```vue
<script setup>
import Button from './Button.vue';
</script>

<template>
  <Button label="Click me" variant="primary" />
</template>
```

### Exporting Target Component (Optional)

For better experience in Playground and Matrix modes, you can export the clean component separately:

```vue
<script setup>
import Button from './Button.vue';
</script>

<script>
// Export the target component for Playground and Matrix views
import Button from './Button.vue';
export const component = Button;
</script>

<template>
  <div class="p-4 space-y-4">
    <Button label="Primary" variant="primary" />
    <Button label="Secondary" variant="secondary" />
  </div>
</template>
```

### Adding Documentation

Use the `<docs>` block to add markdown documentation that will be displayed in the DevTools panel:

```vue
<docs>
# Button Component

Button is the primary interaction element in the interface.

## Usage

Use `variant="primary"` for primary actions.

Usage example:

    <Button label="Save" variant="primary" />
</docs>

<script setup>
import Button from './Button.vue';
</script>

<template>
  <Button label="Example" />
</template>
```

## Preview Modes

The plugin provides three different preview modes, each optimized for different use cases:

### 1. Stories Mode (Default)

**Purpose**: View your story file exactly as written, with all variants and examples.

- Renders the entire story component as-is
- Shows multiple component variants in one view
- Perfect for documentation and showcasing different use cases
- No interactive controls - pure presentation

**Use when**: You want to see all your examples together, like a showcase page.

### 2. Playground Mode

**Purpose**: Interactive component testing with live prop editing.

- **Left Panel**: Control panel with three tabs:
  - **Controls**: Edit props with auto-generated UI (text inputs, checkboxes, selects, JSON editors)
  - **Events**: View and log component events in real-time
  - **Code**: See generated Vue code for current component usage
- **Right Panel**: Live preview of the component
- Uses the clean component (if exported) or falls back to story wrapper
- Canvas tools available: viewport sizes, zoom, background options

**Use when**: You want to test different prop combinations interactively.

### 3. Matrix Mode

**Purpose**: View all possible prop combinations in a grid layout.

- Automatically generates combinations of all props
- Shows component variations in a matrix/grid
- Great for visual regression testing
- Uses the clean component (if exported) for better results

**Use when**: You want to see all possible states of your component at once.

## Usage Examples

### Example 1: Simple Story with Auto-bind

The plugin automatically analyzes your component and creates controls. Props from the panel will automatically fall through to your component.

**src/components/Button.vue** (Source component)

```vue
<script setup lang="ts">
defineProps<{
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}>();
</script>

<template>
  <button class="btn" :class="variant" :disabled="disabled">
    {{ label }}
  </button>
</template>
```

**src/components/Button.stories.vue** (Story)

```vue
<script setup>
import Button from './Button.vue';
</script>

<script>
// Export clean component for Playground/Matrix
import Button from './Button.vue';
export const component = Button;
</script>

<template>
  <!-- 
    In Stories mode: Shows all variants
    In Playground mode: Controls panel will have:
    - Input for "label" (string)
    - Select for "variant" (primary | secondary | danger)
    - Checkbox for "disabled" (boolean)
  -->
  <div class="p-4 space-y-4">
    <Button label="Primary Button" variant="primary" />
    <Button label="Secondary Button" variant="secondary" />
    <Button label="Danger Button" variant="danger" />
    <Button label="Disabled Button" disabled />
  </div>
</template>
```

### Example 2: Story with Wrapper and Context

If your component needs specific context (background, container, etc.), add it in the story:

**src/components/Header.stories.vue**

```vue
<script setup>
import Header from './Header.vue';
</script>

<template>
  <!-- Wrapper to simulate environment -->
  <div class="bg-gray-100 p-4 border rounded-lg w-full max-w-lg">
    <Header />
  </div>
</template>
```

### Example 3: Complex Story with Slots

You can use the story as a regular Vue component to show complex use cases:

**src/components/Card.stories.vue**

```vue
<docs>
# Card Component

Card is a universal container for grouping related content.
</docs>

<script setup>
import Card from './Card.vue';
import Button from '../Button/Button.vue';
</script>

<script>
import Card from './Card.vue';
export const component = Card;
</script>

<template>
  <div class="p-10 flex flex-col gap-4 max-w-2xl">
    <!-- Variant 1: Simple usage -->
    <Card title="Hello World" description="This is a simple card example">
      <p>This is the card content.</p>
    </Card>

    <!-- Variant 2: With footer slot -->
    <Card title="Card with Actions" description="This card has a footer">
      <p>Card content goes here.</p>
      <template #footer>
        <div class="flex gap-2">
          <Button label="Save" variant="primary" />
          <Button label="Cancel" variant="secondary" />
        </div>
      </template>
    </Card>
  </div>
</template>
```

## How It Works

### File Discovery

The plugin automatically scans your project for `.stories.vue` files and displays them in a file tree in the DevTools panel.

### Component Analysis

When you select a story:
1. The plugin analyzes the source component (e.g., `Button.vue`) using `vue-docgen-api`
2. Extracts props, events, slots, and their types
3. Generates appropriate UI controls based on prop types:
   - `string` → Text input
   - `number` → Number input
   - `boolean` → Checkbox (toggle switch)
   - Union types (`'primary' | 'secondary'`) → Select dropdown
   - Objects/Arrays → JSON editor
   - Smart detection for common boolean props (`disabled`, `loading`, `is*`, `has*`)

### Interactive Controls

In Playground mode:
- **Controls Tab**: Edit props with auto-generated UI. Changes update the preview in real-time
- **Events Tab**: View all events emitted by the component with timestamps and payloads
- **Code Tab**: See the generated Vue code for the current component usage. Freeze to copy code snippets

### Canvas Tools

Available in Stories and Playground modes:
- **Viewport**: Switch between responsive, mobile (375px), tablet (768px), desktop (1280px)
- **Rotate**: Rotate mobile/tablet viewports
- **Zoom**: Zoom in/out (0.2x - 3x)
- **Background**: Grid, light, dark, or transparent

## Prop Type Detection

The plugin uses intelligent type detection:

1. **Explicit Configuration**: If you provide `componentPropsMeta`, it uses that
2. **Value Type**: Checks the current prop value type
3. **Metadata Analysis**: Uses `vue-docgen-api` type information
4. **Heuristic Detection**: 
   - Boolean keywords: `disabled`, `loading`, `active`, `checked`, `selected`, `readonly`, `required`, `visible`, `open`, `show`, `hide`, `dense`, `outline`, `rounded`, `border`, `flat`, `solid`, `ghost`
   - Pattern matching: Props starting with `is` or `has` (e.g., `isEnabled`, `hasError`)

## Key Features

- **No Config**: No need to register stories in config files. Just create a `.stories.vue` file
- **Isolation**: Stories render in an isolated overlay layer, but have access to Pinia, Router, and global plugins
- **Hot Module Replacement (HMR)**: Editing `.stories.vue` files instantly updates the overlay without page reload
- **Type Safety**: Full TypeScript support with automatic type inference
- **Documentation**: Markdown documentation blocks displayed in the panel
- **Code Generation**: Automatic Vue code generation for component usage examples

## Tips & Best Practices

1. **Export Clean Component**: Always export `export const component = YourComponent` for better Playground and Matrix experience
2. **Use Stories Mode for Showcases**: Create multiple variants in your story template for documentation
3. **Use Playground Mode for Testing**: Test edge cases and prop combinations interactively
4. **Use Matrix Mode for Visual Testing**: See all prop combinations at once for visual regression
5. **Document with `<docs>`**: Add markdown documentation to explain component usage
6. **Name Props Clearly**: Use descriptive prop names - the plugin will auto-detect types better

## Development

```bash
# Build
pnpm build

# Type check
pnpm typecheck
```

## License

MIT
