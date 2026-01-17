[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / detectPackageManager

# Function: detectPackageManager()

> **detectPackageManager**(`root`): [`PackageManagerInfo`](../interfaces/PackageManagerInfo.md)

Defined in: [package-manager.ts:31](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils-node/src/package-manager.ts#L31)

Detect package manager by checking lockfiles first, then falling back to npm_config_user_agent

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `root` | `string` | Project root directory |

## Returns

[`PackageManagerInfo`](../interfaces/PackageManagerInfo.md)

Package manager info with name and lockfile
