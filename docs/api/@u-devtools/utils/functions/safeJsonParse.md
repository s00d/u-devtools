[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / safeJsonParse

# Function: safeJsonParse()

> **safeJsonParse**\<`T`\>(`text`, `defaultValue`): `T` \| `null`

Defined in: [json.ts:8](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils/src/json.ts#L8)

Safely parses a JSON string with error handling.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `text` | `string` | `undefined` | JSON string to parse |
| `defaultValue` | `T` \| `null` | `null` | Default value to return if parsing fails |

## Returns

`T` \| `null`

Parsed object or default value
