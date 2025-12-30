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
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  server: {
    // IMPORTANT: File system access configuration
    // Vite requires explicit permission to access files outside the project root.
    // DevTools plugins (like i18n) need to read/write files in your project,
    // so we need to grant access to the project directory.
    fs: {
      allow: [__dirname],
    },
    // Optional: Enable polling for file watching (useful in some environments)
    watch: {
      usePolling: true,
    },
  },
});
```

**Important:** If you're using plugins that interact with the file system (like the i18n plugin), you must configure `server.fs.allow` to grant Vite permission to access your project files. This is required because Vite restricts file system access by default for security reasons.

## Options

- `base?: string` - Base path for DevTools UI (default: `'/__devtools'`)
- `plugins?: DevToolsPlugin[]` - Array of plugins to load
- `enabled?: boolean` - Enable or disable DevTools (default: `true`)

## Documentation

For complete documentation, see the [main README](https://github.com/s00d/u-devtools).

## License

MIT

