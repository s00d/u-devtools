[**Universal DevTools Kit SDK**](../../../../README.md)

***

[Universal DevTools Kit SDK](../../../../packages.md) / [@u-devtools/kit](../../README.md) / [context](../README.md) / createDevToolsContext

# Function: createDevToolsContext()

> **createDevToolsContext**(): `object`

Defined in: [context.ts:46](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L46)

Creates an isolated context storage for a plugin.

Since each plugin is bundled by Vite, we can use
module closure to store context. This is the most reliable, fast and
framework-independent way.

## Returns

Pair of functions: setupDevTools (for initialization) and useDevTools (for usage).

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `setupDevTools()` | (`ctx`) => `void` | Initializes the context. Called once at startup (in renderMain or setup). | [context.ts:132](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L132) |
| `useApi()` | () => [`ClientApi`](../../../core/interfaces/ClientApi.md) \| `undefined` | Gets api from context. **Throws** Error if context is not initialized | [context.ts:132](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L132) |
| `useBridge()` | () => [`AppBridge`](../../../core/classes/AppBridge.md)\<`any`\> | Gets bridge from context. **Throws** Error if context is not initialized | [context.ts:132](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L132) |
| `useDevTools()` | () => [`DevToolsContext`](../interfaces/DevToolsContext.md) | Gets the current context. Works in any function, component or callback after initialization. **Throws** Error if context is not initialized | [context.ts:132](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L132) |
| `useToast()` | () => [`Toast`](../interfaces/Toast.md) | Gets toast from context. **Throws** Error if context is not initialized | [context.ts:132](https://github.com/s00d/u-devtools/blob/4fad699ef961c28a06cb020d0eeb977e28429dd0/packages/kit/src/context.ts#L132) |

## Example

```typescript
// In plugin's context.ts
import { createDevToolsContext } from '@u-devtools/kit';

export const { setupDevTools, useDevTools } = createDevToolsContext();

// In client.ts
import { setupDevTools } from './context';

renderMain(container, api) {
  const bridge = new AppBridge('my-plugin');
  setupDevTools({ api, bridge });
  // ... render UI
}

// In component
import { useDevTools } from './context';

const { api, bridge, toast } = useDevTools();
```
