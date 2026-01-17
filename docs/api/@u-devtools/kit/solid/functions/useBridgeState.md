[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [solid](../README.md) / useBridgeState

# Function: useBridgeState()

> **useBridgeState**\<`T`\>(`syncedState`): \[() => `T`, (`value`) => `void`\]

Defined in: [solid.ts:30](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/solid.ts#L30)

Solid adapter for SyncedState.
Converts SyncedState to Solid signal with two-way synchronization.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> | SyncedState instance to synchronize |

## Returns

\[() => `T`, (`value`) => `void`\]

Solid signal synchronized with SyncedState

## Example

```typescript
import { useBridgeState } from '@u-devtools/kit/solid';
import { AppBridge } from '@u-devtools/core';

// Create bridge and state
const bridge = new AppBridge('my-plugin');
const isOpen = bridge.state('isOpen', false);

// In component
function MyComponent() {
  const [isOpenValue, setIsOpen] = useBridgeState(isOpen);
  
  // Use isOpenValue() and setIsOpen in your component
  return <div>{isOpenValue() ? 'ON' : 'OFF'}</div>;
}
```
