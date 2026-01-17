[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / SyncedState

# Class: SyncedState\<T\>

Defined in: [bridge-app.ts:36](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L36)

Universal state class with automatic synchronization between App and Client contexts.
Implements "Handshake" protocol for getting current data on initialization.

Use this for state that needs to be shared between App context (main window) 
and Client context (DevTools iframe). Changes are automatically synchronized.

## Example

```typescript
import { AppBridge } from '@u-devtools/core';

// Create bridge
const bridge = new AppBridge('my-plugin');

// Create synced state
const isOpen = bridge.state('isOpen', false);
const count = bridge.state('count', 0);

// Update value (automatically syncs to Client)
isOpen.value = true;
count.value = 42;

// Subscribe to changes
const unsubscribe = isOpen.subscribe((value) => {
  console.log('State changed:', value);
});

// Cleanup
unsubscribe();
```

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | Type of the state value |

## Constructors

### Constructor

> **new SyncedState**\<`T`\>(`bridge`, `key`, `initialValue`): `SyncedState`\<`T`\>

Defined in: [bridge-app.ts:41](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L41)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bridge` | [`AppBridge`](AppBridge.md)\<`any`\> |
| `key` | `string` |
| `initialValue` | `T` |

#### Returns

`SyncedState`\<`T`\>

## Accessors

### value

#### Get Signature

> **get** **value**(): `T`

Defined in: [bridge-app.ts:79](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L79)

##### Returns

`T`

#### Set Signature

> **set** **value**(`newValue`): `void`

Defined in: [bridge-app.ts:83](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L83)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `newValue` | `T` |

##### Returns

`void`

## Methods

### getSnapshot()

> **getSnapshot**(): `T`

Defined in: [bridge-app.ts:104](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L104)

#### Returns

`T`

***

### subscribe()

> **subscribe**(`fn`): () => `void`

Defined in: [bridge-app.ts:96](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L96)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`val`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`
