[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/core

# @u-devtools/core

[![npm version](https://img.shields.io/npm/v/@u-devtools/core/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/core)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/core?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/core)
[![License](https://img.shields.io/npm/l/@u-devtools/core?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/core)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

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

- **AppBridge** - Typed communication bridge between App context and Client context
- **SyncedState** - Universal state synchronization class with React `useSyncExternalStore` support
- **Control** - DevTools control utilities

### Vite Configuration

- **vite.config.base** - Base Vite configuration for building DevTools packages

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

### Using AppBridge with Typed Protocol

```ts
import { AppBridge } from '@u-devtools/core';

// Define your protocol
interface MyPluginProtocol {
  'element-selected': (data: { id: string }) => void;
  'toggle-inspector': (data: { state: boolean }) => void;
}

// Create typed bridge
const bridge = new AppBridge<MyPluginProtocol>('my-plugin');

// ✅ Full type safety
bridge.send('element-selected', { id: 'el-1' });
bridge.on('toggle-inspector', ({ state }) => {
  // state is automatically typed as { state: boolean }
});
```

### Using SyncedState

```ts
import { AppBridge, SyncedState } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');

// Create synced state
const isOpen = bridge.state('isOpen', false);

// Read value
console.log(isOpen.value);

// Update value (automatically syncs)
isOpen.value = true;

// Subscribe to changes
const unsub = isOpen.subscribe((val) => {
  console.log('Changed:', val);
});

// Use with React useSyncExternalStore
import { useSyncExternalStore } from 'react';
const enabled = useSyncExternalStore(
  isOpen.subscribe,
  isOpen.getSnapshot
);
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

## License

MIT

## Classes

- [AppBridge](classes/AppBridge.md)
- [BroadcastTransport](classes/BroadcastTransport.md)
- [DevToolsControl](classes/DevToolsControl.md)
- [HmrTransport](classes/HmrTransport.md)
- [SyncedState](classes/SyncedState.md)
- [Transport](classes/Transport.md)
- [TypedEventBus](classes/TypedEventBus.md)
- [WebSocketTransport](classes/WebSocketTransport.md)

## Interfaces

- [BusEvents](interfaces/BusEvents.md)
- [ClientApi](interfaces/ClientApi.md)
- [ClipboardApi](interfaces/ClipboardApi.md)
- [DevToolsPlugin](interfaces/DevToolsPlugin.md)
- [DialogApi](interfaces/DialogApi.md)
- [EventBusApi](interfaces/EventBusApi.md)
- [GeneralMenuItem](interfaces/GeneralMenuItem.md)
- [InspectorEvent](interfaces/InspectorEvent.md)
- [NavigationApi](interfaces/NavigationApi.md)
- [OverlayContext](interfaces/OverlayContext.md)
- [OverlayMenuItem](interfaces/OverlayMenuItem.md)
- [PluginClientInstance](interfaces/PluginClientInstance.md)
- [PluginCommand](interfaces/PluginCommand.md)
- [PluginMetadata](interfaces/PluginMetadata.md)
- [PluginSettingsSchema](interfaces/PluginSettingsSchema.md)
- [RpcClientInterface](interfaces/RpcClientInterface.md)
- [RpcMessage](interfaces/RpcMessage.md)
- [RpcServerInterface](interfaces/RpcServerInterface.md)
- [ServerContext](interfaces/ServerContext.md)
- [SettingsApi](interfaces/SettingsApi.md)
- [SettingSchemaDef](interfaces/SettingSchemaDef.md)
- [ShortcutApi](interfaces/ShortcutApi.md)
- [StorageApi](interfaces/StorageApi.md)

## Type Aliases

- [PluginSettingsSchemaType](type-aliases/PluginSettingsSchemaType.md)
- [RpcMessageType](type-aliases/RpcMessageType.md)
- [SettingSchemaDefType](type-aliases/SettingSchemaDefType.md)
- [SettingType](type-aliases/SettingType.md)
- [UnmountFn](type-aliases/UnmountFn.md)

## Variables

- [devtools](variables/devtools.md)
- [PluginSettingsSchemaSchema](variables/PluginSettingsSchemaSchema.md)
- [RpcMessageSchema](variables/RpcMessageSchema.md)
- [SettingOptionSchema](variables/SettingOptionSchema.md)
- [SettingSchemaDefSchema](variables/SettingSchemaDefSchema.md)
- [SettingTypeSchema](variables/SettingTypeSchema.md)

## Functions

- [validatePluginSettingsSchema](functions/validatePluginSettingsSchema.md)
- [validateRpcMessage](functions/validateRpcMessage.md)
- [validateSettingSchemaDef](functions/validateSettingSchemaDef.md)
- [validateSettingValue](functions/validateSettingValue.md)
