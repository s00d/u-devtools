[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / serialize

# Function: serialize()

> **serialize**\<`T`\>(`data`): `T`

Defined in: [serialize.ts:8](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils/src/serialize.ts#L8)

Serializes data by removing functions and circular references.
Useful for sending complex objects through BroadcastChannel or JSON.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `T` | Data to serialize |

## Returns

`T`

Serialized data with functions removed and circular references replaced with '[Circular]'
