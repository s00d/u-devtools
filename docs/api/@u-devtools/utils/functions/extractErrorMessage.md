[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils](../README.md) / extractErrorMessage

# Function: extractErrorMessage()

> **extractErrorMessage**(`error`): `string`

Defined in: [error-handler.ts:29](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/utils/src/error-handler.ts#L29)

Extracts error message from unknown error value.
Handles Error instances, error-like objects, and primitive values.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `error` | `unknown` | Error value of unknown type |

## Returns

`string`

Extracted error message as string

## Example

```ts
try {
  // some code
} catch (e) {
  const message = extractErrorMessage(e);
  console.error(message);
}
```
