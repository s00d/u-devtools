[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / AppBridge

# Class: AppBridge\<Protocol\>

Defined in: [bridge-app.ts:150](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L150)

AppBridge - Typed communication bridge between App context (main window) and Client context (DevTools iframe).

Communication: App ↔ Client via BroadcastChannel API

Provides type-safe event-based communication with automatic state synchronization.

## Example

```typescript
import { AppBridge } from '@u-devtools/core';

// Define protocol for type-safe communication
interface MyPluginProtocol {
  'element-selected': (data: { id: string; html: string }) => void;
  'toggle-inspector': (data: { state: boolean }) => void;
}

const typedBridge = new AppBridge<MyPluginProtocol>('my-plugin');

// Send events (type-safe)
typedBridge.send('element-selected', { id: 'el-1', html: '<div>...</div>' });

// Listen to events (type-safe)
typedBridge.on('toggle-inspector', ({ state }) => {
  // state is automatically typed as { state: boolean }
  console.log('Inspector toggled:', state);
});

// Create synced state
const selectedElement = typedBridge.state<HTMLElement | null>('selectedElement', null);
selectedElement.value = document.getElementById('my-element');
```

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `Protocol` | `Record`\<`string`, (...`args`) => `any`\> | Type definition for events and their handlers |

## Constructors

### Constructor

> **new AppBridge**\<`Protocol`\>(`namespace`): `AppBridge`\<`Protocol`\>

Defined in: [bridge-app.ts:155](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L155)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `string` |

#### Returns

`AppBridge`\<`Protocol`\>

## Properties

### displayName

> **displayName**: `string`

Defined in: [bridge-app.ts:153](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L153)

***

### namespace

> **namespace**: `string`

Defined in: [bridge-app.ts:152](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L152)

## Methods

### close()

> **close**(): `void`

Defined in: [bridge-app.ts:207](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L207)

#### Returns

`void`

***

### on()

> **on**\<`K`\>(`event`, `cb`): () => `void`

Defined in: [bridge-app.ts:171](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L171)

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| `cb` | `Protocol`\[`K`\] *extends* (...`args`) => `any` ? (`data`) => `void` : `never` |

#### Returns

> (): `void`

##### Returns

`void`

***

### request()

> **request**\<`RequestData`, `ResponseData`\>(`requestEvent`, `requestData`, `responseEvent`, `timeout`, `responseFilter?`): `Promise`\<`ResponseData`\>

Defined in: [bridge-app.ts:180](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L180)

#### Type Parameters

| Type Parameter |
| ------ |
| `RequestData` |
| `ResponseData` |

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `requestEvent` | `string` | `undefined` |
| `requestData` | `RequestData` | `undefined` |
| `responseEvent` | `string` | `undefined` |
| `timeout` | `number` | `5000` |
| `responseFilter?` | (`request`, `response`) => `boolean` | `undefined` |

#### Returns

`Promise`\<`ResponseData`\>

***

### send()

> **send**\<`K`\>(`event`, ...`args`): `void`

Defined in: [bridge-app.ts:163](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L163)

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* `string` \| `number` \| `symbol` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| ...`args` | `Protocol`\[`K`\] *extends* (...`args`) => `any` ? `P` : \[\] |

#### Returns

`void`

***

### state()

> **state**\<`T`\>(`key`, `initialValue`): [`SyncedState`](SyncedState.md)\<`T`\>

Defined in: [bridge-app.ts:211](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/bridge-app.ts#L211)

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `initialValue` | `T` |

#### Returns

[`SyncedState`](SyncedState.md)\<`T`\>
