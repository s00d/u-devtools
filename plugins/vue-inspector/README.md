# @u-devtools/plugin-vue-inspector

[![npm version](https://img.shields.io/npm/v/@u-devtools/plugin-vue-inspector/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vue-inspector)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/plugin-vue-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vue-inspector)
[![License](https://img.shields.io/npm/l/@u-devtools/plugin-vue-inspector?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/plugin-vue-inspector)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Vue Inspector plugin for Universal DevTools. Inspect Vue Router routes, components, and Pinia stores.

## Installation

```bash
npm install -D @u-devtools/plugin-vue-inspector
```

## Usage

```ts
import { vueInspectorPlugin } from '@u-devtools/plugin-vue-inspector';
import { createDevTools } from '@u-devtools/vite';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [vueInspectorPlugin()]
    })
  ]
});
```

## Setup

Register your Vue Router instance in `main.ts`:

```ts
if (import.meta.env.DEV) {
  (window as any).__U_DEVTOOLS_VUE_ROUTER__ = router;
}
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/plugins/vue-inspector)
