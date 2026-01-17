[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-console

# @u-devtools/plugin-console

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-console/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-console)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-console?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-console)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-console?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-console)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Console logger plugin for Universal DevTools. Captures and displays console messages from your application.

## Installation

```bash
npm install -D @u-devtools/plugin-console
```

## Usage

```ts
import { consolePlugin } from '@u-devtools/plugin-console';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [consolePlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/console)

## Variables

- [plugin](variables/plugin.md)

## Functions

- [consolePlugin](functions/consolePlugin.md)
