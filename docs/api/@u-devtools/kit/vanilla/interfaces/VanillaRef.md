[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [vanilla](../README.md) / VanillaRef

# Interface: VanillaRef\<T\>

Defined in: [vanilla.ts:11](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/vanilla.ts#L11)

Reactive variable interface for Vanilla JS

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Properties

### dispose()

> **dispose**: () => `void`

Defined in: [vanilla.ts:19](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/vanilla.ts#L19)

Unsubscribes from updates.

#### Returns

`void`

***

### value

> **value**: `T`

Defined in: [vanilla.ts:15](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/vanilla.ts#L15)

Current value. When assigned, automatically updates SyncedState.
