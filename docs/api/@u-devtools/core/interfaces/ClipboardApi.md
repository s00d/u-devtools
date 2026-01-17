[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / ClipboardApi

# Interface: ClipboardApi

Defined in: [index.ts:179](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L179)

## Methods

### copy()

> **copy**(`text`, `successMessage?`): `Promise`\<`void`\>

Defined in: [index.ts:185](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L185)

Copy text to clipboard.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `text` | `string` | Text to copy |
| `successMessage?` | `string` | Success message (optional) |

#### Returns

`Promise`\<`void`\>

***

### read()

> **read**(): `Promise`\<`string`\>

Defined in: [index.ts:191](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L191)

Read text from clipboard.

#### Returns

`Promise`\<`string`\>

Text from clipboard or empty string on error
