# @u-devtools/plugin-i18n

Translation management plugin for Universal DevTools. Visual JSON editor for i18n files with auto-save.

## Installation

```bash
npm install -D @u-devtools/plugin-i18n
```

## Usage

```ts
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        i18nPlugin({ dir: 'src/locales' })
      ]
    })
  ]
});
```

## Options

- `dir` (string, required): Path to directory containing JSON translation files

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/i18n)
