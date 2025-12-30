# @u-devtools/plugin-terminal

Terminal plugin for Universal DevTools. Run npm scripts and shell commands directly from DevTools.

## Installation

```bash
npm install -D @u-devtools/plugin-terminal
```

## Usage

```ts
import { terminalPlugin } from '@u-devtools/plugin-terminal';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [terminalPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/terminal)

