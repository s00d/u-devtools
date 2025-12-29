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

## Tailwind CSS v4

- Always add `@reference "tailwindcss";` in scoped styles
- Use dark theme classes directly (no `dark:` prefix needed)
- **Theme is always dark only** - do not implement light theme support

```vue
<style scoped>
@reference "tailwindcss";

.container {
  @apply bg-gray-900 text-white;
}
</style>
```

## CSS Variables

Use theme variables when available:
- `--udt-primary` - Primary color
- `--udt-bg` - Background
- `--udt-text` - Text color
- `--udt-border` - Border color

## Icons

Use Heroicons via `UIcon` component:
```vue
<UIcon name="Cube" class="w-5 h-5" />
```

Available icon names: Cube, Bolt, Cog6Tooth, XMark, etc.

## Color Palette

- Background: `bg-gray-900` / `bg-gray-800`
- Text: `text-white` / `text-gray-400`
- Borders: `border-gray-700` / `border-gray-800`
- Primary: `bg-indigo-600` / `text-indigo-400`

