# @u-devtools/plugin-inspector

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-inspector/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-inspector)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-inspector)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-inspector)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Element inspector plugin for Universal DevTools. Inspect and edit DOM elements, attributes, styles, and classes.

## Installation

```bash
npm install -D @u-devtools/plugin-inspector
```

## Usage

```ts
import { inspectorPlugin } from '@u-devtools/plugin-inspector';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [inspectorPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/inspector)
