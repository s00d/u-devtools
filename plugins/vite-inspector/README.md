# @u-devtools/plugin-vite-inspector

Vite Inspector plugin for Universal DevTools. Deep dive into Vite configuration, plugins, environment variables, and server management.

## Installation

```bash
npm install -D @u-devtools/plugin-vite-inspector
```

## Usage

```ts
import { viteInspectorPlugin } from '@u-devtools/plugin-vite-inspector';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [viteInspectorPlugin()]
    })
  ]
});
```

## Features

- View resolved Vite configuration
- Inspect plugin execution order
- Monitor environment variables
- Restart server and clear cache

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/vite-inspector)
