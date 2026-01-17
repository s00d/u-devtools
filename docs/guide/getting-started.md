# Getting Started

Welcome to Universal DevTools Kit! This guide will help you get started with building custom DevTools.

## Installation

Install the Vite plugin:

```bash
pnpm add -D @u-devtools/vite
```

## Basic Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { devtools } from '@u-devtools/vite'

export default defineConfig({
  plugins: [
    devtools({
      // Your plugin configuration
    })
  ]
})
```

## Create Your First Plugin

Use the CLI to scaffold a new plugin:

```bash
pnpm create u-devtools-plugin
```

Or create a plugin manually:

```typescript
import { definePlugin } from '@u-devtools/kit/define-plugin'

export default definePlugin({
  name: 'my-plugin',
  clientPath: './src/client.ts',
  setupServer(rpc, ctx) {
    // Server-side logic
  }
})
```

## Next Steps

- Learn about the [Architecture](./architecture.md)
- Read the [Plugin Development Guide](./plugin-development.md)
- Explore the [API Reference](/api/packages)
