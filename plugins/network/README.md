# @u-devtools/plugin-network

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-network/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-network)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-network?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-network)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-network?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-network)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Network logger plugin for Universal DevTools. Intercepts and logs all fetch/XHR requests with detailed information.

## Installation

```bash
npm install -D @u-devtools/plugin-network
```

## Usage

```ts
import { networkPlugin } from '@u-devtools/plugin-network';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [networkPlugin()]
    })
  ]
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/network)
