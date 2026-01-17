# @u-devtools/plugin-storage

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-storage/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-storage)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-storage?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-storage)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-storage?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-storage)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

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

