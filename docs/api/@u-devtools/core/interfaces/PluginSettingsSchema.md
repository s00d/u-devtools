[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / PluginSettingsSchema

# Interface: PluginSettingsSchema

Defined in: [index.ts:416](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/core/src/index.ts#L416)

Plugin settings schema - defines all user-configurable settings for a plugin.

Settings are automatically displayed in the DevTools settings panel and
can be accessed via `api.settings.get()` and `api.settings.set()`.

## Example

```ts
const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube',
  settings: {
    apiUrl: {
      label: 'API URL',
      type: 'string',
      default: 'https://api.example.com'
    },
    timeout: {
      label: 'Timeout (ms)',
      type: 'number',
      default: 5000
    }
  }
};
```

## Indexable

\[`key`: `string`\]: [`SettingSchemaDef`](SettingSchemaDef.md)
