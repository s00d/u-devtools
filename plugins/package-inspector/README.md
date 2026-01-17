# @u-devtools/plugin-package-inspector

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-package-inspector/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-package-inspector)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-package-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-package-inspector)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-package-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-package-inspector)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Package inspector plugin for Universal DevTools. View and analyze project dependencies from package.json.

## Installation

```bash
npm install -D @u-devtools/plugin-package-inspector
```

## Usage

```ts
import { packageInspectorPlugin } from '@u-devtools/plugin-package-inspector';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [packageInspectorPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/package-inspector)

