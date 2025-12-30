# create-u-devtools

CLI tool to scaffold Universal DevTools plugins. Built with [Hygen](https://www.hygen.io/) for easy template management.

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
- **Features to include** (checkboxes):
  - Settings Schema
  - Command Palette Commands
  - Sidebar Panel
  - Overlay Menu Item
  - File System Operations (Server)
  - App Context Communication

## What It Creates

The generator creates a complete plugin structure:

```
my-plugin/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── index.ts      # Plugin entry point
    ├── client.ts     # Client UI definition
    ├── app.ts        # App context script
    └── ui/
        └── MyPanel.vue  # Example Vue component
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

