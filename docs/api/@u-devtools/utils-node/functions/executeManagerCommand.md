[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / executeManagerCommand

# Function: executeManagerCommand()

> **executeManagerCommand**(`manager`, `command`, `args`, `cwd`, `options?`): `Promise`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>

Defined in: [package-manager.ts:193](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils-node/src/package-manager.ts#L193)

Execute any package manager command

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `manager` | [`PackageManager`](../type-aliases/PackageManager.md) | Package manager name |
| `command` | `string` | Command name (e.g., 'view', 'list', 'info') |
| `args` | `string`[] | Command arguments |
| `cwd` | `string` | Working directory |
| `options?` | \{ `maxBuffer?`: `number`; \} | Execution options |
| `options.maxBuffer?` | `number` | - |

## Returns

`Promise`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>

Command output
