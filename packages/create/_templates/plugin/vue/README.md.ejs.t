---
to: <%= projectName %>/README.md
---
# <%= packageName %>

[![npm version](https://img.shields.io/npm/v/<%= packageName %>/latest?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName %>)
[![npm downloads](https://img.shields.io/npm/dw/<%= packageName %>?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName %>)
[![License](https://img.shields.io/npm/l/<%= packageName %>?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName %>)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

<%= description %>

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

<% if (features.includes('commands')) { -%>
<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>
## Commands

- `<%= pluginKebab %>:example` - Example command

<% } -%>
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

