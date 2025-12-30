# @u-devtools/plugin-vue-inspector

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
