[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/core](../README.md) / OverlayMenuItem

# Interface: OverlayMenuItem

Defined in: [control.ts:41](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L41)

## Properties

### icon?

> `optional` **icon**: `string`

Defined in: [control.ts:44](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L44)

***

### iconSvg?

> `optional` **iconSvg**: `string`

Defined in: [control.ts:45](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L45)

***

### iconUrl?

> `optional` **iconUrl**: `string`

Defined in: [control.ts:46](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L46)

***

### id

> **id**: `string`

Defined in: [control.ts:42](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L42)

***

### label

> **label**: `string`

Defined in: [control.ts:43](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L43)

***

### onBlur()?

> `optional` **onBlur**: (`ctx`, `event`) => `void`

Defined in: [control.ts:61](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L61)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `FocusEvent` |

#### Returns

`void`

***

### onClick()?

> `optional` **onClick**: (`ctx`, `event`) => `void`

Defined in: [control.ts:51](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L51)

Event handlers (receive context)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onContextMenu()?

> `optional` **onContextMenu**: (`ctx`, `event`) => `void`

Defined in: [control.ts:53](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L53)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onDoubleClick()?

> `optional` **onDoubleClick**: (`ctx`, `event`) => `void`

Defined in: [control.ts:52](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L52)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onFocus()?

> `optional` **onFocus**: (`ctx`, `event`) => `void`

Defined in: [control.ts:60](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L60)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `FocusEvent` |

#### Returns

`void`

***

### onKeyDown()?

> `optional` **onKeyDown**: (`ctx`, `event`) => `void`

Defined in: [control.ts:58](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L58)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `KeyboardEvent` |

#### Returns

`void`

***

### onKeyUp()?

> `optional` **onKeyUp**: (`ctx`, `event`) => `void`

Defined in: [control.ts:59](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L59)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `KeyboardEvent` |

#### Returns

`void`

***

### onMouseDown()?

> `optional` **onMouseDown**: (`ctx`, `event`) => `void`

Defined in: [control.ts:56](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L56)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onMouseEnter()?

> `optional` **onMouseEnter**: (`ctx`, `event`) => `void`

Defined in: [control.ts:54](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L54)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onMouseLeave()?

> `optional` **onMouseLeave**: (`ctx`, `event`) => `void`

Defined in: [control.ts:55](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L55)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### onMouseUp()?

> `optional` **onMouseUp**: (`ctx`, `event`) => `void`

Defined in: [control.ts:57](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L57)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ctx` | [`OverlayContext`](OverlayContext.md) |
| `event` | `MouseEvent` |

#### Returns

`void`

***

### order?

> `optional` **order**: `number`

Defined in: [control.ts:47](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/core/src/control.ts#L47)
