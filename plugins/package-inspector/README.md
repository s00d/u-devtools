# @u-devtools/plugin-package-inspector

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

