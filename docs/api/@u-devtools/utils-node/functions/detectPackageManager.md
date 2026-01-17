[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / detectPackageManager

# Function: detectPackageManager()

> **detectPackageManager**(`root`): [`PackageManagerInfo`](../interfaces/PackageManagerInfo.md)

Defined in: [package-manager.ts:31](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/package-manager.ts#L31)

Detect package manager by checking lockfiles first, then falling back to npm_config_user_agent

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `root` | `string` | Project root directory |

## Returns

[`PackageManagerInfo`](../interfaces/PackageManagerInfo.md)

Package manager info with name and lockfile
