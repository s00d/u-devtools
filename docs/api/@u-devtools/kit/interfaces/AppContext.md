[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/kit](../README.md) / [](../README.md) / AppContext

# Interface: AppContext

Defined in: [index.ts:25](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L25)

## Properties

### api?

> `optional` **api**: `undefined`

Defined in: [index.ts:32](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L32)

ClientApi is only available in client context.
In app context (overlay), api is not provided as it runs on the page.
For app plugins, use module context (Module Singleton) to store the bridge.

***

### bridge

> **bridge**: [`AppBridge`](../../core/classes/AppBridge.md)\<`any`\>

Defined in: [index.ts:26](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L26)

***

### onCleanup()

> **onCleanup**: (`fn`) => `void`

Defined in: [index.ts:37](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/index.ts#L37)

Registers a cleanup function that will be called when the plugin is removed
(e.g., during HMR or overlay unmounting).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | () => `void` |

#### Returns

`void`
