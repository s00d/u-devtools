[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / formatTime

# Function: formatTime()

> **formatTime**(`timestamp`, `locale`): `string`

Defined in: [format.ts:8](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils/src/format.ts#L8)

Formats a timestamp to a readable time string with milliseconds.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `timestamp` | `number` | `undefined` | Unix timestamp in milliseconds |
| `locale` | `string` | `'ru-RU'` | Locale string (default: 'ru-RU') |

## Returns

`string`

Formatted time string (e.g., "14:30:45.123")
