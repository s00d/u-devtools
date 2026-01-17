[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [lit](../README.md) / useBridgeState

# Function: useBridgeState()

> **useBridgeState**\<`T`\>(`host`, `syncedState`): [`BridgeStateController`](../classes/BridgeStateController.md)\<`T`\>

Defined in: [lit.ts:77](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/lit.ts#L77)

Helper for creating controller (for convenience)

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `host` | `ReactiveControllerHost` | ReactiveControllerHost (usually LitElement) |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> | SyncedState instance to synchronize |

## Returns

[`BridgeStateController`](../classes/BridgeStateController.md)\<`T`\>

BridgeStateController instance

## Example

```typescript
class MyElement extends LitElement {
  private isOpen = useBridgeState(this, bridge.state('isOpen', false));
}
```
