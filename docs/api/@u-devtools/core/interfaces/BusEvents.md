[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / BusEvents

# Interface: BusEvents

Defined in: [event-bus.ts:19](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L19)

EventBus events interface.
Plugins can extend this interface through module augmentation.

## Example

```typescript
// In your plugin
declare module '@u-devtools/core' {
  interface BusEvents {
    'my-plugin:custom-event': { data: string };
  }
}
```

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### navigate

> **navigate**: `object`

Defined in: [event-bus.ts:22](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L22)

#### path

> **path**: `string`

***

### plugin:mounted

> **plugin:mounted**: `object`

Defined in: [event-bus.ts:20](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L20)

#### name

> **name**: `string`

***

### plugin:unmounted

> **plugin:unmounted**: `object`

Defined in: [event-bus.ts:21](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L21)

#### name

> **name**: `string`

***

### settings:changed

> **settings:changed**: `object`

Defined in: [event-bus.ts:23](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L23)

#### key

> **key**: `string`

#### value

> **value**: `unknown`

***

### storage:changed

> **storage:changed**: `object`

Defined in: [event-bus.ts:24](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/event-bus.ts#L24)

#### key

> **key**: `string`

#### value

> **value**: `unknown`
