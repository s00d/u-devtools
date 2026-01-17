[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/ui](../README.md) / UseResizableOptions

# Interface: UseResizableOptions

Defined in: [composables/useResizable.ts:5](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L5)

## Properties

### direction?

> `optional` **direction**: [`ResizeDirection`](../type-aliases/ResizeDirection.md)

Defined in: [composables/useResizable.ts:10](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L10)

Направление ресайза

#### Default

```ts
'vertical'
```

***

### max?

> `optional` **max**: `number` \| () => `number`

Defined in: [composables/useResizable.ts:26](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L26)

Максимальное значение (может быть функцией для динамического вычисления)

***

### min?

> `optional` **min**: `number` \| () => `number`

Defined in: [composables/useResizable.ts:22](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L22)

Минимальное значение (может быть функцией для динамического вычисления)

***

### onResizeEnd()?

> `optional` **onResizeEnd**: () => `void`

Defined in: [composables/useResizable.ts:18](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L18)

Callback при окончании ресайза

#### Returns

`void`

***

### onResizeStart()?

> `optional` **onResizeStart**: () => `void`

Defined in: [composables/useResizable.ts:14](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/ui/src/composables/useResizable.ts#L14)

Callback при начале ресайза

#### Returns

`void`
