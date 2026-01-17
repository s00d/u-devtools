[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / GeneralMenuItem

# Interface: GeneralMenuItem

Defined in: [index.ts:444](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L444)

Menu item for the "General" section in ActivityBar.

Allows plugins to add their actions to the general menu, even if the plugin
itself is hidden from the main ActivityBar menu.

## Example

```ts
const plugin: PluginClientInstance = {
  name: 'Plugins',
  icon: 'Squares2X2',
  hideFromMenu: true,
  generalMenuItems: [
    {
      label: 'Extensions',
      icon: 'Squares2X2',
      action: (api) => {
        api.navigation.openPlugin('Plugins');
      }
    }
  ]
};
```

## Properties

### action()

> **action**: (`api`) => `void`

Defined in: [index.ts:453](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L453)

Action callback when menu item is clicked.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `api` | [`ClientApi`](ClientApi.md) | Client API for interacting with DevTools |

#### Returns

`void`

***

### icon

> **icon**: `string`

Defined in: [index.ts:448](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L448)

Heroicons icon name (e.g., 'Cube', 'MagnifyingGlass')

***

### label

> **label**: `string`

Defined in: [index.ts:446](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/index.ts#L446)

Menu item label text
