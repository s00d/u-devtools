# create-u-devtools

CLI tool to scaffold Universal DevTools plugins. Built with [Hygen](https://www.hygen.io/) for easy template management.

The generator provides templates for multiple frameworks, allowing you to create plugins using your preferred technology stack.

## Usage

### In Monorepo

From the root of the monorepo:

```bash
pnpm create:plugin
```

### As Published Package

Once published to npm, users can run:

```bash
npm create u-devtools@latest
# or
pnpm create u-devtools
# or
yarn create u-devtools
```

The tool will ask you:
- **Project folder name** (e.g., `plugins/my-feature`)
- **Plugin display name** (e.g., `My Feature`)
- **Package name** (e.g., `@u-devtools/plugin-my-feature`)
- **Description**
- **Template** - Choose your framework (Vue, React, Solid, Svelte, Vanilla, Astro)
- **Features to include** (checkboxes):
  - Settings Schema
  - Command Palette Commands
  - Sidebar Panel
  - Overlay Menu Item
  - File System Operations (Server)
  - App Context Communication

## What It Creates

The generator creates a complete plugin structure tailored to your chosen framework:

```
my-plugin/
├── package.json          # Framework-specific dependencies
├── vite.config.ts       # Vite config with framework plugin
├── tsconfig.json         # TypeScript configuration
├── svelte.config.js      # (Svelte only)
└── src/
    ├── index.ts          # Plugin entry point
    ├── server.ts         # Server RPC handlers
    ├── client.tsx/.ts    # Client UI definition
    ├── app.ts            # App context script (optional)
    └── ui/
        └── [Component]   # Framework-specific component
            - Vue: MyPanel.vue
            - React: ReactPanel (in client.tsx)
            - Solid: SolidPanel (in client.tsx)
            - Svelte: SveltePanel.svelte
            - Vanilla: vanilla-panel.ts
            - Astro: astro-panel.ts (Lit Web Component)
```

## Next Steps

After scaffolding:

1. Install dependencies:
   ```bash
   cd my-plugin
   pnpm install
   ```

2. Build the plugin:
   ```bash
   pnpm build
   ```

3. Add to playground:
   - Import in `playground/vite.config.ts`
   - Register in `createDevTools({ plugins: [...] })`

4. Test in playground:
   ```bash
   pnpm dev
   ```

## Development

To build the CLI tool:

```bash
cd packages/create
pnpm build
```

The `_templates` directory is included in the npm package, so no copying is needed. Templates use EJS syntax (e.g., `<%= pluginName %>`, `<%= packageName %>`) which Hygen automatically replaces.

## Available Templates

The generator supports multiple framework templates:

- **vue** - Vue 3 with Composition API (default)
- **react** - React 18 with hooks
- **solid** - SolidJS with signals
- **svelte** - Svelte 5 with runes
- **vanilla** - Vanilla JavaScript/TypeScript (no framework)
- **astro** - Web Components with Lit (Astro-style)

Each template includes:
- Framework-specific configuration (Vite, TypeScript)
- Example UI component demonstrating API usage
- Server RPC handlers
- App context script (optional)
- Complete build setup

