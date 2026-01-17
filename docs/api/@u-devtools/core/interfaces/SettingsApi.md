[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / SettingsApi

# Interface: SettingsApi

Defined in: [index.ts:148](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L148)

Settings API for user-configurable plugin settings.
Settings are displayed in DevTools settings panel and persist across sessions.

## Example

```typescript
import type { SettingsApi } from '@u-devtools/core';

function useSettings(api: SettingsApi) {
  // Get setting with default
  const fontSize = api.get('fontSize', 14);
  const theme = api.get('theme', 'dark');
  const enabled = api.get('enabled', true);

  // Set settings
  api.set('fontSize', 16);
  api.set('theme', 'light');
  api.set('enabled', false);

  // Access all settings reactively (for Vue bindings)
  const allSettings = api.all;
}
```

## Properties

### all

> **all**: `Record`\<`string`, `unknown`\>

Defined in: [index.ts:166](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L166)

Reactive object of all settings (for UI bindings)

## Methods

### get()

> **get**\<`T`\>(`key`, `defaultValue?`): `T`

Defined in: [index.ts:154](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L154)

Get a setting value.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Setting key (without plugin prefix) |
| `defaultValue?` | `T` | Default value if setting is not set |

#### Returns

`T`

***

### set()

> **set**(`key`, `value`): `void`

Defined in: [index.ts:161](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L161)

Set a setting value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Setting key |
| `value` | `unknown` | New value |

#### Returns

`void`
