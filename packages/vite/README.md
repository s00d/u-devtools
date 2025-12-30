# @u-devtools/vite

Vite plugin for Universal DevTools Kit. Automatically injects DevTools into your Vite application.

## Installation

```bash
npm install -D @u-devtools/vite @u-devtools/client @u-devtools/overlay
# or
pnpm add -D @u-devtools/vite @u-devtools/client @u-devtools/overlay
# or
yarn add -D @u-devtools/vite @u-devtools/client @u-devtools/overlay
```

## Usage

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { myPlugin } from './plugins/my-plugin';

export default defineConfig({
  plugins: [
    createDevTools({
      base: '/__devtools', // Optional, default: '/__devtools'
      plugins: [
        myPlugin(),
        // ... other plugins
      ],
    }),
  ],
});
```

## Options

- `base?: string` - Base path for DevTools UI (default: `'/__devtools'`)
- `plugins?: DevToolsPlugin[]` - Array of plugins to load
- `enabled?: boolean` - Enable or disable DevTools (default: `true`)

## Documentation

For complete documentation, see the [main README](https://github.com/s00d/u-devtools).

## License

MIT

