[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / SettingSchemaDef

# Interface: SettingSchemaDef

Defined in: [index.ts:373](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L373)

Setting schema definition for a single setting.
Used to define user-configurable settings that appear in the DevTools settings panel.

## Example

```typescript
const pluginWithSettings: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube',

  settings: {
    fontSize: {
      label: 'Font Size',
      description: 'Base font size for the plugin',
      type: 'number',
      default: 14,
    },
    theme: {
      label: 'Theme',
      type: 'select',
      default: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
  },

  renderMain(container, api) {
    // Access settings
    const fontSize = api.settings.get('fontSize', 14);
    const theme = api.settings.get('theme', 'dark');

    return () => {};
  }
};
```

## Properties

### default?

> `optional` **default**: `unknown`

Defined in: [index.ts:381](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L381)

Default value

***

### description?

> `optional` **description**: `string`

Defined in: [index.ts:377](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L377)

Optional description/tooltip text

***

### items?

> `optional` **items**: `Record`\<`string`, `SettingSchemaDef`\>

Defined in: [index.ts:385](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L385)

Schema for array items (for 'array' type with object items)

***

### itemType?

> `optional` **itemType**: `"string"` \| `"number"`

Defined in: [index.ts:387](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L387)

Item type for 'array' type with primitive items ('string' or 'number')

***

### label

> **label**: `string`

Defined in: [index.ts:375](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L375)

Display label for the setting

***

### options?

> `optional` **options**: `object`[]

Defined in: [index.ts:383](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L383)

Options for 'select' type settings

#### label

> **label**: `string`

#### value

> **value**: `unknown`

***

### type

> **type**: [`SettingType`](../type-aliases/SettingType.md)

Defined in: [index.ts:379](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L379)

Setting type (determines input component)
