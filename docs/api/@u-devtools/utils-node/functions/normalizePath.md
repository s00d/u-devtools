[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / normalizePath

# Function: normalizePath()

> **normalizePath**(`filePath`): `string`

Defined in: [path.ts:12](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/path.ts#L12)

Normalizes a file path to use forward slashes (/) for cross-platform compatibility.
This is especially important for Windows paths that use backslashes (\).
Useful when injecting paths into HTML, virtual modules, or URLs.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The file path to normalize |

## Returns

`string`

The normalized path with forward slashes
