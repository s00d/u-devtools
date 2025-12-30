# @u-devtools/plugin-network

Network logger plugin for Universal DevTools. Intercepts and logs all fetch/XHR requests with detailed information.

## Installation

```bash
npm install -D @u-devtools/plugin-network
```

## Usage

```ts
import { networkPlugin } from '@u-devtools/plugin-network';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [networkPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/network)
