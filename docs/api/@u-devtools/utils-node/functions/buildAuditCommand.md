[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / buildAuditCommand

# Function: buildAuditCommand()

> **buildAuditCommand**(`manager`, `json`): `string` \| `null`

Defined in: [package-manager.ts:149](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/package-manager.ts#L149)

Build audit command for a package manager

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `manager` | [`PackageManager`](../type-aliases/PackageManager.md) | `undefined` | Package manager name |
| `json` | `boolean` | `false` | Whether to output JSON format |

## Returns

`string` \| `null`

Command string or null if not supported
