# @u-devtools/plugin-i18n

Translation management plugin for Universal DevTools. Visual JSON editor for i18n files with auto-save.

## Installation

```bash
npm install -D @u-devtools/plugin-i18n
```

## Usage

```ts
import { defineConfig } from 'vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';
import { createDevTools } from '@u-devtools/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        i18nPlugin({ dir: 'src/locales' })
      ]
    })
  ],
  server: {
    // IMPORTANT: File system access configuration
    // Vite requires explicit permission to access files outside the project root.
    // The i18n plugin needs to read/write translation files in your project,
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

**Important:** The i18n plugin requires file system access to read and write translation files. You must configure `server.fs.allow` in your Vite config to grant permission. Without this configuration, the plugin will not be able to access your translation files.

## Options

- `dir` (string, required): Path to directory containing JSON translation files

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/i18n)
