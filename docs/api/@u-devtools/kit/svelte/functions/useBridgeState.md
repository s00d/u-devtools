[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [svelte](../README.md) / useBridgeState

# Function: useBridgeState()

> **useBridgeState**\<`T`\>(`syncedState`): [`SvelteStore`](../interfaces/SvelteStore.md)\<`T`\>

Defined in: [svelte.ts:39](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/svelte.ts#L39)

Svelte adapter for SyncedState.
Converts SyncedState to Svelte Writable Store.
Allows using $state syntax in Svelte components.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> | SyncedState instance to synchronize |

## Returns

[`SvelteStore`](../interfaces/SvelteStore.md)\<`T`\>

Svelte store compatible with Svelte's store contract

## Example

```typescript
import { useBridgeState } from '@u-devtools/kit/svelte';
import { AppBridge } from '@u-devtools/core';

// Create bridge and state
const bridge = new AppBridge('my-plugin');
const isOpen = bridge.state('isOpen', false);

// Convert to Svelte store
const isOpenStore = useBridgeState(isOpen);

// In Svelte component:
// <button on:click={() => $isOpenStore = !$isOpenStore}>
//   {$isOpenStore ? 'Open' : 'Closed'}
// </button>
```
