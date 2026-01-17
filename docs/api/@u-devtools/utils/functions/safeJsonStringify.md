[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / safeJsonStringify

# Function: safeJsonStringify()

> **safeJsonStringify**(`value`, `defaultValue`): `string`

Defined in: [json.ts:23](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils/src/json.ts#L23)

Safely stringifies an object with error handling.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `value` | `unknown` | `undefined` | Value to stringify |
| `defaultValue` | `string` | `'{}'` | Default string to return if stringification fails |

## Returns

`string`

JSON string or default value
