[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / buildAuditCommand

# Function: buildAuditCommand()

> **buildAuditCommand**(`manager`, `json`): `string` \| `null`

Defined in: [package-manager.ts:149](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils-node/src/package-manager.ts#L149)

Build audit command for a package manager

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `manager` | [`PackageManager`](../type-aliases/PackageManager.md) | `undefined` | Package manager name |
| `json` | `boolean` | `false` | Whether to output JSON format |

## Returns

`string` \| `null`

Command string or null if not supported
