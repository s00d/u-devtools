[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / DevToolsControl

# Class: DevToolsControl

Defined in: [control.ts:70](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L70)

## Constructors

### Constructor

> **new DevToolsControl**(): `DevToolsControl`

Defined in: [control.ts:73](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L73)

#### Returns

`DevToolsControl`

## Methods

### close()

> **close**(): `void`

Defined in: [control.ts:88](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L88)

Close DevTools

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [control.ts:150](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L150)

#### Returns

`void`

***

### isOpen()

> **isOpen**(): `Promise`\<`boolean`\>

Defined in: [control.ts:102](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L102)

Get current state (asynchronously)

#### Returns

`Promise`\<`boolean`\>

***

### onStateChange()

> **onStateChange**(`cb`): () => `void`

Defined in: [control.ts:126](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L126)

Subscribe to state changes

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cb` | (`isOpen`) => `void` |

#### Returns

> (): `void`

##### Returns

`void`

***

### open()

> **open**(): `void`

Defined in: [control.ts:81](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L81)

Open DevTools

#### Returns

`void`

***

### switchPlugin()

> **switchPlugin**(`pluginName`): `void`

Defined in: [control.ts:139](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L139)

Switch to plugin by name

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pluginName` | `string` |

#### Returns

`void`

***

### switchTab()

> **switchTab**(`pluginName`, `tabName`): `void`

Defined in: [control.ts:146](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L146)

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

> **toggle**(): `void`

Defined in: [control.ts:95](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/control.ts#L95)

Toggle state

#### Returns

`void`
