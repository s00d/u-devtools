[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-terminal

# @u-devtools/plugin-terminal

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-terminal/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-terminal)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-terminal?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-terminal)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-terminal?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-terminal)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Terminal plugin for Universal DevTools. Run npm scripts and shell commands directly from DevTools.

## Installation

```bash
npm install -D @u-devtools/plugin-terminal
```

## Usage

```ts
import { terminalPlugin } from '@u-devtools/plugin-terminal';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [terminalPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/terminal)

## Variables

- [plugin](variables/plugin.md)

## Functions

- [terminalPlugin](functions/terminalPlugin.md)
