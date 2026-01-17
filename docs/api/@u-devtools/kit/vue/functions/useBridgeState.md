[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vue](../README.md) / useBridgeState

# Function: useBridgeState()

> **useBridgeState**\<`T`\>(`syncedState`): `Ref`\<`T`\>

Defined in: [vue.ts:34](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/vue.ts#L34)

Vue adapter for SyncedState.
Converts SyncedState to Vue ref with two-way synchronization.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> | SyncedState instance to synchronize |

## Returns

`Ref`\<`T`\>

Vue ref synchronized with SyncedState

## Example

```typescript
import { useBridgeState } from '@u-devtools/kit/vue';
import { AppBridge } from '@u-devtools/core';
import { watch } from 'vue';

// Create bridge and state
const bridge = new AppBridge('my-plugin');
const isOpen = bridge.state('isOpen', false);

// Convert to Vue ref
const isOpenRef = useBridgeState(isOpen);

// Use as normal Vue ref
watch(isOpenRef, (value) => {
  console.log('Vue reactive:', value);
});

// Update
isOpenRef.value = true;
```
