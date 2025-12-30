# @u-devtools/plugin-inspector

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
