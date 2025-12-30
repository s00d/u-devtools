---
to: <%= projectName %>/README.md
---
# <%= packageName %>

<%= description %>

This plugin is built with **Vanilla JavaScript** (TypeScript) and demonstrates vanilla JS integration with Universal DevTools.

<% if (features.includes('settings')) { -%>
## Features

- Settings schema support
<% } -%>
<% if (features.includes('commands')) { -%>
- Command palette commands
<% } -%>
<% if (features.includes('sidebar')) { -%>
- Sidebar panel
<% } -%>
<% if (features.includes('overlay')) { -%>
- Overlay menu item
<% } -%>
<% if (features.includes('filesystem')) { -%>
- File system operations (server-side)
<% } -%>
<% if (features.includes('app-bridge')) { -%>
- App context communication
<% } -%>

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
<%
  const pluginFunctionName = pluginName
    .replace(/\s+/g, '')
    .replace(/^./, (c) => c.toLowerCase())
    .replace(/\s*([A-Z])/g, (_, c) => c) + 'Plugin';
-%>
import { <%= pluginFunctionName %> } from '<%= packageName %>';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        <%= pluginFunctionName %>()
      ]
    })
  ]
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck
```

## License

MIT

