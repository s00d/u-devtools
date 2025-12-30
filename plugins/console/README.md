# @u-devtools/plugin-console

Console logger plugin for Universal DevTools. Captures and displays console messages from your application.

## Installation

```bash
npm install -D @u-devtools/plugin-console
```

## Usage

```ts
import { consolePlugin } from '@u-devtools/plugin-console';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [consolePlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/console)

