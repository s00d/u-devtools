[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / formatTime

# Function: formatTime()

> **formatTime**(`timestamp`, `locale`): `string`

Defined in: [format.ts:8](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils/src/format.ts#L8)

Formats a timestamp to a readable time string with milliseconds.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `timestamp` | `number` | `undefined` | Unix timestamp in milliseconds |
| `locale` | `string` | `'ru-RU'` | Locale string (default: 'ru-RU') |

## Returns

`string`

Formatted time string (e.g., "14:30:45.123")
