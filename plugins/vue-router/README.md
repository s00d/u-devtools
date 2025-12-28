# @u-devtools/plugin-vue-router

Vue Router inspector plugin for Universal DevTools. This plugin is **Vue-specific** and requires Vue Router to be installed in your project.

## Features

- View all routes in your Vue Router configuration
- See the current active route
- Monitor route changes in real-time
- Navigate to routes directly from DevTools
- View route metadata and parameters

## Installation

The plugin is already included when you use `@u-devtools/vite`. Just add it to your Vite config:

```typescript
import { createDevTools } from '@u-devtools/vite';
import { vueRouterPlugin } from '@u-devtools/plugin-vue-router';

export default defineConfig({
  plugins: [
    vue(),
    createDevTools({
      plugins: [
        vueRouterPlugin()
      ]
    })
  ]
});
```

## Setup

To enable the plugin, you need to register your Vue Router instance in your `main.ts`:

```typescript
import { createApp } from 'vue';
import { createRouter } from 'vue-router';
import App from './App.vue';

const router = createRouter({
  // ... your router config
});

const app = createApp(App);
app.use(router);

// Register router for DevTools (dev mode only)
if (import.meta.env.DEV) {
  (window as any).__U_DEVTOOLS_VUE_ROUTER__ = router;
}

app.mount('#app');
```

## Usage

1. Open DevTools (click the 🛠 button)
2. Select the "Vue Router" tab
3. View all routes and the current active route
4. Click the navigation button (→) to navigate to any route

## Framework-Specific Note

This plugin is **Vue-specific** and will not work with React or other frameworks. For framework-agnostic routing inspection, consider using the Network plugin to monitor route changes.

