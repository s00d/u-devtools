[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / safeLocalStorageGet

# Function: safeLocalStorageGet()

> **safeLocalStorageGet**\<`T`\>(`key`, `defaultValue`): `T`

Defined in: [json.ts:38](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils/src/json.ts#L38)

Safely parses a JSON string from localStorage.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | localStorage key |
| `defaultValue` | `T` | Default value to return if key doesn't exist or parsing fails |

## Returns

`T`

Parsed object or default value
