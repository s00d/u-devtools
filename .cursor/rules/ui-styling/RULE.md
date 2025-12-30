---
description: "UI components, styling with Tailwind CSS v4, and dark theme guidelines"
globs:
  - "**/*.vue"
  - "packages/ui/**/*"
alwaysApply: false
---

# UI and Styling Guidelines

## UI Components

Use components from `@u-devtools/ui`:

```vue
<script setup lang="ts">
import { UButton, UInput, UModal, UIcon } from '@u-devtools/ui';
</script>

<template>
  <UButton variant="primary" icon="Bolt">Click</UButton>
  <UInput v-model="value" />
  <UIcon name="Cube" />
</template>
```

## Tailwind CSS v4 - STRICT RULES

**CRITICAL: NO CSS FILES OR STYLE BLOCKS**

- ❌ **NEVER** use `<style>` blocks in Vue components
- ❌ **NEVER** create separate CSS files
- ❌ **NEVER** use `@apply` or `@reference` directives
- ✅ **ALWAYS** use Tailwind CSS classes directly in HTML/template
- ✅ **ALWAYS** use inline Tailwind classes for all styling
- ✅ Use dark theme classes directly (no `dark:` prefix needed)
- ✅ **Theme is always dark only** - do not implement light theme support

### Correct Example:
```vue
<template>
  <div class="bg-gray-900 text-white p-4 rounded-lg border border-gray-700">
    <h1 class="text-xl font-bold text-indigo-400">Title</h1>
    <p class="text-gray-400">Description</p>
  </div>
</template>
```

### Incorrect Examples:
```vue
<!-- ❌ WRONG: Using style block -->
<style scoped>
.container {
  @apply bg-gray-900;
}
</style>

<!-- ❌ WRONG: Using CSS variables in style attribute -->
<div style="background-color: var(--udt-bg)">

<!-- ❌ WRONG: Custom CSS classes -->
<div class="custom-container">
<style>
.custom-container { background: #000; }
</style>
```

## Animations

Use Tailwind animation classes:
- `animate-spin` for loading spinners
- `animate-[fade-in-up_0.2s_ease-out]` for custom animations
- `transition-all` for smooth transitions

For keyframes, define them in `packages/client/src/style.css` only (centralized location).

## Icons

Use Heroicons via `UIcon` component:
```vue
<UIcon name="Cube" class="w-5 h-5 text-indigo-400" />
```

Available icon names: Cube, Bolt, Cog6Tooth, XMark, etc.

## Color Palette

- Background: `bg-gray-900` / `bg-gray-800` / `bg-zinc-950`
- Text: `text-white` / `text-gray-400` / `text-gray-200`
- Borders: `border-gray-700` / `border-gray-800` / `border-zinc-800`
- Primary: `bg-indigo-600` / `text-indigo-400` / `bg-indigo-500/20`
- Hover states: `hover:bg-gray-800` / `hover:text-gray-200`

## Dynamic Styles

For dynamic styles that cannot be expressed as Tailwind classes, use inline `style` attribute sparingly:
```vue
<div :style="{ width: `${dynamicWidth}px`, opacity: dynamicOpacity }">
```

Prefer computed Tailwind classes when possible:
```vue
<div :class="[`w-${size}`, `opacity-${opacity}`]">
```

