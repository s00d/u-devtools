[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / OverlayContext

# Interface: OverlayContext

Defined in: [control.ts:3](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L3)

## Properties

### close()

> **close**: () => `void`

Defined in: [control.ts:12](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L12)

Close the main DevTools window

#### Returns

`void`

***

### createBridge()

> **createBridge**: (`namespace`) => [`AppBridge`](../classes/AppBridge.md)

Defined in: [control.ts:38](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L38)

Create a temporary bridge for sending messages.
Useful if you don't have access to the plugin's global bridge in this scope.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `string` |

#### Returns

[`AppBridge`](../classes/AppBridge.md)

***

### isOpen

> **isOpen**: `boolean`

Defined in: [control.ts:22](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L22)

Current state

***

### open()

> **open**: () => `void`

Defined in: [control.ts:7](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L7)

Open the main DevTools window

#### Returns

`void`

***

### switchPlugin()

> **switchPlugin**: (`pluginName`) => `void`

Defined in: [control.ts:27](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L27)

Switch to plugin by name

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pluginName` | `string` |

#### Returns

`void`

***

### switchTab()

> **switchTab**: (`pluginName`, `tabName`) => `void`

Defined in: [control.ts:32](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L32)

Switch tab within plugin by tab name

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pluginName` | `string` |
| `tabName` | `string` |

#### Returns

`void`

***

### toggle()

> **toggle**: () => `void`

Defined in: [control.ts:17](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L17)

Toggle window state

#### Returns

`void`
