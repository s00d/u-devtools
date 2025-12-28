# @u-devtools/ui

Universal UI component library for DevTools plugins.

## Components

### Basic Components

- **UButton** - Button with variants (primary, secondary, ghost, danger) and sizes
- **UInput** - Text input field
- **USelect** - Dropdown select
- **UBadge** - Status badge with colors
- **UIcon** - Icon wrapper component

### Layout Components

- **UTable** - Data table with customizable columns and cell templates
- **UTabs** - Tab navigation component
- **UTabButtons** - Button-style tabs (alternative to UTabs)
- **USplitter** - Resizable panes (horizontal/vertical)
- **UModal** - Modal dialog component
- **UCard** - Card container with optional title/subtitle

### Data Display

- **UJsonTree** - JSON tree viewer with editing support
- **UCodeBlock** - Code block with syntax highlighting
- **UKeyValue** - Key-value pair display with copy functionality
- **UStat** - Statistic card with colored backgrounds

### State Components

- **ULoading** - Loading spinner with optional text
- **UEmpty** - Empty state placeholder with icon and message

## Usage

```vue
<script setup>
import { UButton, UTable, ULoading, UEmpty } from '@u-devtools/ui';
</script>

<template>
  <UButton variant="primary" icon="i-carbon-save">Save</UButton>
  <ULoading text="Loading..." />
  <UEmpty icon="i-carbon-search" title="No data" description="Try refreshing" />
</template>
```

## Styling

All components use CSS variables defined in `style.css`:
- `--udt-c-primary` - Primary color
- `--udt-c-bg` - Background color
- `--udt-c-border` - Border color
- `--udt-c-text` - Text color

Components automatically support dark mode via the `html.dark` class.

