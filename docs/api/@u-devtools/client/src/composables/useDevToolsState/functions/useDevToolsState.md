[**Universal DevTools Kit SDK**](../../../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../../../packages.md) / [@u-devtools/client](../../../../README.md) / [src/composables/useDevToolsState](../README.md) / useDevToolsState

# Function: useDevToolsState()

> **useDevToolsState**(): `object`

Defined in: [composables/useDevToolsState.ts:151](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L151)

## Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `activePluginId` | `Ref`\<`string`\> | [composables/useDevToolsState.ts:153](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L153) |
| `closeDevTools()` | () => `void` | [composables/useDevToolsState.ts:160](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L160) |
| `connectionError` | `Ref`\<\{ `error`: `string`; `failed`: `boolean`; `url`: `string`; \}\> | [composables/useDevToolsState.ts:162](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L162) |
| `currentPlugin` | `ComputedRef`\<[`PluginClientInstance`](../../../../../core/interfaces/PluginClientInstance.md) \| `undefined`\> | [composables/useDevToolsState.ts:157](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L157) |
| `isAboutActive` | `ComputedRef`\<`boolean`\> | [composables/useDevToolsState.ts:158](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L158) |
| `isManagerActive` | `ComputedRef`\<`boolean`\> | [composables/useDevToolsState.ts:159](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L159) |
| `isPaletteOpen` | `Ref`\<`boolean`\> | [composables/useDevToolsState.ts:155](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L155) |
| `isSidebarExpanded` | `RemovableRef`\<`boolean`\> | [composables/useDevToolsState.ts:156](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L156) |
| `notifications` | `Ref`\<`object`[], `Notification`[] \| `object`[]\> | [composables/useDevToolsState.ts:161](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L161) |
| `plugins` | `ShallowRef`\<[`PluginClientInstance`](../../../../../core/interfaces/PluginClientInstance.md)[]\> | [composables/useDevToolsState.ts:152](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L152) |
| `showSettings` | `Ref`\<`boolean`\> | [composables/useDevToolsState.ts:154](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/client/src/composables/useDevToolsState.ts#L154) |
