[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [web-components](../README.md) / DefineElementOptions

# Interface: DefineElementOptions

Defined in: [web-components.ts:106](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/web-components.ts#L106)

## Properties

### attributes?

> `optional` **attributes**: `string`[]

Defined in: [web-components.ts:112](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/web-components.ts#L112)

List of attributes to observe.
Changes to these attributes will automatically update Vue props.
Example: ['label', 'is-active']

***

### emits?

> `optional` **emits**: `string`[]

Defined in: [web-components.ts:119](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/web-components.ts#L119)

List of events the Vue component emits.
These will be forwarded as standard DOM CustomEvents.
Example: ['change', 'update:modelValue']
