[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / PluginCommand

# Interface: PluginCommand

Defined in: [index.ts:61](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L61)

Command definition for Command Palette (accessible via Cmd+K / Ctrl+K).
Commands allow users to quickly access plugin functionality.

## Properties

### action()

> **action**: () => `void` \| `Promise`\<`void`\>

Defined in: [index.ts:69](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L69)

Action to execute when command is triggered

#### Returns

`void` \| `Promise`\<`void`\>

***

### icon?

> `optional` **icon**: `string`

Defined in: [index.ts:67](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L67)

Heroicons icon name (optional)

***

### id

> **id**: `string`

Defined in: [index.ts:63](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L63)

Unique command identifier (e.g., 'my-plugin:clear')

***

### label

> **label**: `string`

Defined in: [index.ts:65](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L65)

Display label in command palette

***

### shortcut?

> `optional` **shortcut**: `string`[]

Defined in: [index.ts:71](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L71)

Keyboard shortcut keys (e.g., ['Meta', 'K', 'C'])
