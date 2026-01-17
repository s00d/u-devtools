[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / executeCommand

# Function: executeCommand()

> **executeCommand**(`command`, `cwd`, `options?`): `Promise`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>

Defined in: [package-manager.ts:175](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils-node/src/package-manager.ts#L175)

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
