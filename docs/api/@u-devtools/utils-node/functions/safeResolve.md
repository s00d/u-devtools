[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / safeResolve

# Function: safeResolve()

> **safeResolve**(`root`, `targetPath`): `string`

Defined in: [path.ts:27](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils-node/src/path.ts#L27)

Safely resolves a file path relative to a root directory.
Throws an error if the resolved path is outside the root directory.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `root` | `string` | The root directory path |
| `targetPath` | `string` | The target path (relative or absolute) |

## Returns

`string`

The resolved absolute path

## Throws

Error if the path is outside the root directory
