# @u-devtools/electron

[![npm version](https://img.shields.io/npm/v/@u-devtools/electron/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/electron)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/electron?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/electron)
[![License](https://img.shields.io/npm/l/@u-devtools/electron?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/electron)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Electron wrapper for Universal DevTools Kit. Runs Vite DevTools server programmatically inside Electron Main Process.

## Architecture

- **Electron Main Process**: Imports Vite as a library, starts `vite.createServer()` on a random port, and programmatically injects `@u-devtools/vite` and `repo2txt` plugins into the Vite config.
- **Electron Renderer (BrowserWindow)**: Simply opens `http://localhost:{PORT}/__devtools/index.html`, which is served by the internal Vite server.

## Usage

### Development

```bash
pnpm dev
```

This will:
1. Bundle all TypeScript dependencies using esbuild
2. Start Electron
3. Show a dialog to select project folder
4. Start internal Vite server
5. Load DevTools UI in the window

### Build

```bash
pnpm build
pnpm start
```

### Watch Mode

For development with automatic rebuilds:

```bash
pnpm dev:watch
```

## Build System

This package uses **esbuild** to bundle all TypeScript dependencies (`@u-devtools/vite`, `@u-devtools/plugin-repo2txt`, etc.) into a single JavaScript file. This is necessary because:

1. Electron cannot directly execute TypeScript files
2. Workspace dependencies point to `.ts` source files
3. esbuild bundles everything into a single ESM file that Electron can execute

The build script (`scripts/build.mjs`) handles:
- Bundling all local TypeScript dependencies
- Converting TypeScript to JavaScript
- Creating source maps for debugging
- Excluding external dependencies (electron, vite, esbuild)

## Configuration

### Production Build Issues

When packaging Vite inside Electron, the main issue is that Vite and plugins (`@u-devtools/vite`) try to read client files (`packages/client/dist`) from disk. Inside an asar archive (Electron's standard format), paths work differently.

#### Option A (Simple - asar: false)

In `electron-builder.yml`, disable asar. This makes the app a folder with files instead of a single file. Vite can read files normally.

```yaml
asar: false
```

#### Option B (Correct - asset copying)

You need to ensure that `packages/client/dist` and `packages/overlay/dist` are physically accessible.

1. In `packages/vite/src/index.ts`, there's path resolution code that may need patching for Electron.
2. In `createDevTools`, add a `customDistPath` option.
3. In Electron's `main.ts`, use `path.join(process.resourcesPath, 'client-dist')`.
4. Configure `electron-builder` `extraResources` to copy dist folders next to the exe file.

## License

MIT
