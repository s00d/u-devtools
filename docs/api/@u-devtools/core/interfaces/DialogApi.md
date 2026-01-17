[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / DialogApi

# Interface: DialogApi

Defined in: [index.ts:218](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L218)

## Methods

### confirm()

> **confirm**(`options`): `Promise`\<`boolean`\>

Defined in: [index.ts:224](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L224)

Show a confirmation dialog.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `cancelText?`: `string`; `confirmText?`: `string`; `message`: `string`; `title`: `string`; \} | Dialog options |
| `options.cancelText?` | `string` | - |
| `options.confirmText?` | `string` | - |
| `options.message` | `string` | - |
| `options.title` | `string` | - |

#### Returns

`Promise`\<`boolean`\>

Promise with result (true if confirmed)

***

### prompt()

> **prompt**(`options`): `Promise`\<`string` \| `null`\>

Defined in: [index.ts:236](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L236)

Show an input dialog.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `defaultValue?`: `string`; `message`: `string`; `title`: `string`; \} | Dialog options |
| `options.defaultValue?` | `string` | - |
| `options.message` | `string` | - |
| `options.title` | `string` | - |

#### Returns

`Promise`\<`string` \| `null`\>

Promise with entered text or null if cancelled
