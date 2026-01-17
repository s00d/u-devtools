[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/ui

# @u-devtools/ui

[![npm version](https://img.shields.io/npm/v/@u-devtools/ui/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/ui)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/ui?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/ui)
[![License](https://img.shields.io/npm/l/@u-devtools/ui?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/ui)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

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

## Classes

- [UAccordion](classes/UAccordion.md)

## Interfaces

- [ColorOption](interfaces/ColorOption.md)
- [DropdownOption](interfaces/DropdownOption.md)
- [TreeNode](interfaces/TreeNode.md)
- [UseResizableOptions](interfaces/UseResizableOptions.md)

## Type Aliases

- [ResizeDirection](type-aliases/ResizeDirection.md)
- [UDevToolsComponents](type-aliases/UDevToolsComponents.md)

## Functions

- [useResizable](functions/useResizable.md)

## References

### UBadge

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UButton

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UCard

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UCodeBlock

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UColorGrid

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UColorPicker

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UDomNode

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UDropdown

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UEmpty

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UFileTree

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UForm

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UIcon

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UInput

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UJsonTree

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UKeyValue

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### ULoading

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UModal

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UPluginLayout

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### USelect

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### USplitter

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UStat

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UTabButtons

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UTable

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UTabs

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UTextarea

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UTreeView

Renames and re-exports [UAccordion](classes/UAccordion.md)

***

### UVirtualList

Renames and re-exports [UAccordion](classes/UAccordion.md)
