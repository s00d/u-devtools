# @u-devtools/plugin-storage

Storage manager plugin for Universal DevTools. View and edit LocalStorage, SessionStorage, Cookies, IndexedDB, and OPFS.

## Installation

```bash
npm install -D @u-devtools/plugin-storage
```

## Usage

```ts
import { storagePlugin } from '@u-devtools/plugin-storage';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [storagePlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/storage)

