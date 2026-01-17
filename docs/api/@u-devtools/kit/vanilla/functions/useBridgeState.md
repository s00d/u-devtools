[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / useBridgeState

# Function: useBridgeState()

> **useBridgeState**\<`T`\>(`syncedState`, `onChange?`): [`VanillaRef`](../interfaces/VanillaRef.md)\<`T`\>

Defined in: [vanilla.ts:200](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/vanilla.ts#L200)

Vanilla JS equivalent of useBridgeState.
Creates a reactive variable with automatic synchronization.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> | State from core (bridge.state(...)) |
| `onChange?` | (`value`) => `void` | (Optional) Effect function called on every change. Called immediately on initialization (immediate: true). |

## Returns

[`VanillaRef`](../interfaces/VanillaRef.md)\<`T`\>

VanillaRef object with value and dispose

## Example

```typescript
const count = useBridgeState(bridge.state('cnt', 0), (val) => {
  button.textContent = `Count: ${val}`;
});

button.onclick = () => count.value++; // Updates both locally and in bridge
```
