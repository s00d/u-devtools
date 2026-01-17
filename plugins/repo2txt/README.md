# @u-devtools/plugin-repo2txt

repo2txt plugin

## Features

- Settings schema support
- Command palette commands
- Sidebar panel
- Overlay menu item
- File system operations (server-side)
- App context communication

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { repo2txtPlugin } from '@u-devtools/plugin-repo2txt';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        repo2txtPlugin()
      ]
    })
  ]
});
```

## Commands

- `repo2txt:example` - Example command

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck
```

## License

MIT

