# @u-devtools/core

Core types and interfaces for Universal DevTools Kit. This package provides the foundational TypeScript types, interfaces, and utilities used throughout the DevTools ecosystem.

## Installation

```bash
npm install @u-devtools/core
# or
pnpm add @u-devtools/core
# or
yarn add @u-devtools/core
```

## What's Included

### Type Definitions

- **RPC Interfaces** - Types for client-server communication
- **Plugin Interfaces** - Types for creating DevTools plugins
- **API Interfaces** - Types for ClientApi, StorageApi, SettingsApi, etc.
- **Utility Types** - Common types used across the ecosystem

### Core Classes

- **AppBridge** - Communication bridge between App context and Client context
- **Control** - DevTools control utilities

### Vite Configuration

- **vite.config.base** - Base Vite configuration for building DevTools packages
- **clean-timestamp-plugin** - Vite plugin for cleaning timestamp files

## Usage

### Importing Types

```ts
import type {
  DevToolsPlugin,
  PluginClientInstance,
  ClientApi,
  RpcServerInterface,
  ServerContext,
} from '@u-devtools/core';
```

### Using AppBridge

```ts
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');
bridge.send('event-name', data);
```

### Using Vite Config Base

```ts
import { createViteConfig } from '@u-devtools/core/vite.config.base';

export default createViteConfig({
  name: 'MyPackage',
  entry: 'src/index.ts',
  dir: __dirname,
  // ... other options
});
```

## Documentation

For complete documentation, see the [main README](https://github.com/s00d/u-devtools).

## License

MIT

