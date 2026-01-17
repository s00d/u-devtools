[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / TypedEventBus

# Class: TypedEventBus\<T\>

Defined in: [event-bus.ts:67](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L67)

Typed Event Emitter for inter-plugin communication.
Provides type-safe event emission and subscription.

## Example

```typescript
import { TypedEventBus, type BusEvents } from '@u-devtools/core';

// Create event bus instance
const bus = new TypedEventBus<BusEvents>();

// Emit events
bus.emit('plugin:mounted', { name: 'my-plugin' });
bus.emit('navigate', { path: '/settings' });
bus.emit('settings:changed', { key: 'theme', value: 'dark' });

// Subscribe to events
const unsubscribe1 = bus.on('plugin:mounted', ({ name }) => {
  console.log(`Plugin ${name} was mounted`);
});

const unsubscribe2 = bus.on('navigate', ({ path }) => {
  console.log(`Navigating to: ${path}`);
});

// Unsubscribe
unsubscribe1();
unsubscribe2();

// Or use off method (handler must be the same function reference)
const handler = ({ name }: { name: string }) => {
  console.log(`Plugin ${name} was mounted`);
};
bus.on('plugin:mounted', handler);
bus.off('plugin:mounted', handler);
```

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` *extends* `Record`\<`string`, `unknown`\> | [`BusEvents`](../interfaces/BusEvents.md) | Type definition for events and their data |

## Constructors

### Constructor

> **new TypedEventBus**\<`T`\>(): `TypedEventBus`\<`T`\>

#### Returns

`TypedEventBus`\<`T`\>

## Methods

### clear()

> **clear**(): `void`

Defined in: [event-bus.ts:116](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L116)

Clear all subscriptions

#### Returns

`void`

***

### emit()

> **emit**\<`K`\>(`event`, `data`): `void`

Defined in: [event-bus.ts:73](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L73)

Emit an event

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| `data` | `T`\[`K`\] |

#### Returns

`void`

***

### listenerCount()

> **listenerCount**\<`K`\>(`event`): `number`

Defined in: [event-bus.ts:123](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L123)

Get the number of subscribers for an event

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |

#### Returns

`number`

***

### off()

> **off**\<`K`\>(`event`, `handler`): `void`

Defined in: [event-bus.ts:103](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L103)

Unsubscribe from an event

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| `handler` | (`data`) => `void` |

#### Returns

`void`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: [event-bus.ts:85](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L85)

Subscribe to an event

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| `handler` | (`data`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`
