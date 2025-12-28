# @u-devtools/plugin-inspector

DOM element inspector plugin for Universal DevTools.

## Features

- Visual element selection (overlay)
- Element attributes table
- Text content preview
- Cross-frame communication via BroadcastChannel

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { inspectorPlugin } from '@u-devtools/plugin-inspector';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        inspectorPlugin()
      ]
    })
  ]
});
```

## How it works

1. Click "Select Element" button in DevTools
2. Hover over elements on the page (they will be highlighted)
3. Click an element to inspect its properties
4. View attributes and content in the DevTools panel

## License

MIT

