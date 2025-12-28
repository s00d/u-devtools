# @u-devtools/plugin-i18n

Translation management plugin for Universal DevTools.

## Features

- Visual JSON editor
- Auto-save to disk
- "Open in Editor" support (jump to key location in VS Code)
- Persistent file selection (remembers last opened file)

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        i18nPlugin({
          dir: 'src/locales' // Path to your JSON files
        })
      ]
    })
  ]
});
```

## Options

- `dir` (string, required): Path to directory containing JSON translation files.

## Commands

- `i18n.refresh` - Refresh translations from disk

## License

MIT

