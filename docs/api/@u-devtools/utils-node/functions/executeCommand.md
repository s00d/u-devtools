[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / executeCommand

# Function: executeCommand()

> **executeCommand**(`command`, `cwd`, `options?`): `Promise`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>

Defined in: [package-manager.ts:175](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/package-manager.ts#L175)

Execute a shell command

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `string` | Command to execute |
| `cwd` | `string` | Working directory |
| `options?` | \{ `maxBuffer?`: `number`; \} | Execution options |
| `options.maxBuffer?` | `number` | - |

## Returns

`Promise`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>

Command output
