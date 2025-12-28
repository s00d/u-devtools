# @u-devtools/plugin-network

Network request logger plugin for Universal DevTools.

## Features

- Intercepts `fetch` requests
- Real-time request monitoring
- Status code badges (color-coded)
- Request duration tracking
- URL filtering
- Request history (up to 100 requests)

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { networkPlugin } from '@u-devtools/plugin-network';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        networkPlugin()
      ]
    })
  ]
});
```

## Commands

- `net.clear` - Clear request history

## License

MIT

