[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [lit](../README.md) / BridgeStateController

# Class: BridgeStateController\<T\>

Defined in: [lit.ts:30](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L30)

Lit adapter for SyncedState.
Works as a Reactive Controller.
Automatically calls requestUpdate() on component when state changes.

## Example

```typescript
import { useBridgeState } from '@u-devtools/kit/lit';
import { useDevTools } from './context';

class MyElement extends LitElement {
  private bridge = useDevTools().bridge;
  private isOpen = useBridgeState(this, this.bridge.state('isOpen', false));

  render() {
    return html`
      <button @click=${() => this.isOpen.value = !this.isOpen.value}>
        ${this.isOpen.value ? 'Open' : 'Closed'}
      </button>
    `;
  }
}
```

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | State value type |

## Implements

- `ReactiveController`

## Constructors

### Constructor

> **new BridgeStateController**\<`T`\>(`host`, `syncedState`): `BridgeStateController`\<`T`\>

Defined in: [lit.ts:33](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L33)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `host` | `ReactiveControllerHost` |
| `syncedState` | [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\> |

#### Returns

`BridgeStateController`\<`T`\>

## Properties

### host

> `protected` **host**: `ReactiveControllerHost`

Defined in: [lit.ts:34](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L34)

***

### syncedState

> `protected` **syncedState**: [`SyncedState`](../../../core/classes/SyncedState.md)\<`T`\>

Defined in: [lit.ts:35](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L35)

## Accessors

### value

#### Get Signature

> **get** **value**(): `T`

Defined in: [lit.ts:53](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L53)

##### Returns

`T`

#### Set Signature

> **set** **value**(`v`): `void`

Defined in: [lit.ts:57](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L57)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `v` | `T` |

##### Returns

`void`

## Methods

### hostConnected()

> **hostConnected**(): `void`

Defined in: [lit.ts:40](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L40)

Called when the host is connected to the component tree. For custom
element hosts, this corresponds to the `connectedCallback()` lifecycle,
which is only called when the component is connected to the document.

#### Returns

`void`

#### Implementation of

`ReactiveController.hostConnected`

***

### hostDisconnected()

> **hostDisconnected**(): `void`

Defined in: [lit.ts:46](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/kit/src/lit.ts#L46)

Called when the host is disconnected from the component tree. For custom
element hosts, this corresponds to the `disconnectedCallback()` lifecycle,
which is called the host or an ancestor component is disconnected from the
document.

#### Returns

`void`

#### Implementation of

`ReactiveController.hostDisconnected`
