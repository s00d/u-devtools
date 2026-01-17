[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / ClientApi

# Interface: ClientApi

Defined in: [index.ts:305](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L305)

Client API - Main API object provided to plugins in Client context.
Provides access to all DevTools services: RPC, storage, settings, notifications, etc.

Available in: Client context (Vue 3 iframe)

## Example

```typescript
import type { PluginClientInstance } from '@u-devtools/core';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube',

  renderMain(container, api) {
    // Use api.storage for plugin state
    api.storage.set('lastView', 'list');
    const lastView = api.storage.get('lastView', 'default');

    // Use api.settings for user preferences
    api.settings.set('fontSize', 16);
    const fontSize = api.settings.get('fontSize', 14);

    // Navigation
    api.navigation.openPlugin('other-plugin');

    // Event bus
    api.bus.on('other-plugin:event', (data) => {
      console.log('Received event:', data);
    });
    api.bus.emit('my-plugin:event', { data: 'value' });

    // Async operations (use async IIFE for await)
    (async () => {
      // Use api.rpc to call server methods
      const data = await api.rpc.call('my-plugin:getData');

      // Notifications
      api.notify('Data saved successfully', 'success');

      // Clipboard
      await api.clipboard.copy('text to copy');

      // Dialog
      const confirmed = await api.dialog.confirm({
        title: 'Confirm',
        message: 'Are you sure?',
      });
    })();

    return () => {}; // Cleanup function
  }
};
```

## Properties

### bus

> **bus**: [`EventBusApi`](EventBusApi.md)

Defined in: [index.ts:319](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L319)

Event bus for plugin-to-plugin communication

***

### clipboard

> **clipboard**: [`ClipboardApi`](ClipboardApi.md)

Defined in: [index.ts:317](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L317)

Clipboard operations API

***

### dialog

> **dialog**: [`DialogApi`](DialogApi.md)

Defined in: [index.ts:321](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L321)

Dialog API for confirmations and prompts

***

### navigation

> **navigation**: [`NavigationApi`](NavigationApi.md)

Defined in: [index.ts:323](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L323)

Navigation API for switching between plugins

***

### notify()

> **notify**: (`msg`, `type?`) => `void`

Defined in: [index.ts:309](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L309)

Show a notification to the user

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| `type?` | `"success"` \| `"error"` \| `"info"` |

#### Returns

`void`

***

### rpc

> **rpc**: [`RpcClientInterface`](RpcClientInterface.md)

Defined in: [index.ts:307](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L307)

RPC client for calling server methods

***

### settings

> **settings**: [`SettingsApi`](SettingsApi.md)

Defined in: [index.ts:313](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L313)

Settings API for user-configurable preferences (e.g., font size, theme)

***

### shortcuts

> **shortcuts**: [`ShortcutApi`](ShortcutApi.md)

Defined in: [index.ts:315](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L315)

Keyboard shortcuts API

***

### storage

> **storage**: [`StorageApi`](StorageApi.md)

Defined in: [index.ts:311](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L311)

Storage API for plugin-specific persistent state (e.g., last opened file)
