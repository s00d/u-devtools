# @u-devtools/plugin-vite-inspector

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-vite-inspector/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vite-inspector)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-vite-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vite-inspector)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-vite-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vite-inspector)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

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
