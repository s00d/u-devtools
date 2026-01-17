[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / StorageApi

# Interface: StorageApi

Defined in: [index.ts:99](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L99)

Storage API for plugin-specific persistent storage.
Used for internal plugin state (e.g., last opened file, view preferences).
Storage is isolated per plugin and persists across sessions.

## Example

```typescript
import type { StorageApi } from '@u-devtools/core';

function useStorage(api: StorageApi) {
  // Store values
  api.set('lastView', 'list');
  api.set('filters', { category: 'all', sort: 'name' });
  api.set('items', ['item1', 'item2', 'item3']);

  // Retrieve values with defaults
  const lastView = api.get('lastView', 'default');
  const filters = api.get('filters', { category: 'all' });
  const items = api.get<string[]>('items', []);

  // Remove values
  api.remove('lastView');
}
```

## Methods

### get()

> **get**\<`T`\>(`key`, `def`): `T`

Defined in: [index.ts:107](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L107)

Get a stored value.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | Type of the stored value |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Storage key |
| `def` | `T` | Default value if key doesn't exist |

#### Returns

`T`

Stored value or default

***

### remove()

> **remove**(`key`): `void`

Defined in: [index.ts:121](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L121)

Remove a stored value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Storage key to remove |

#### Returns

`void`

***

### set()

> **set**\<`T`\>(`key`, `value`): `void`

Defined in: [index.ts:115](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L115)

Set a stored value.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | Type of the value |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Storage key |
| `value` | `T` | Value to store |

#### Returns

`void`
