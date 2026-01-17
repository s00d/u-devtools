---
description: "RPC communication patterns between Server and Client using ViteRpcClient and ViteRpcServer"
globs:
  - "**/server.ts"
  - "**/client.ts"
alwaysApply: false
---

# RPC Communication Patterns

## Client → Server (ViteRpcClient)

```typescript
// In client.ts or Vue component
try {
  const result = await api.rpc.call('plugin:method', { data: 'value' });
} catch (error) {
  api.notify(`Error: ${error}`, 'error');
}

// Subscribe to events
const unsubscribe = api.rpc.on('plugin:event', (data) => {
  console.log(data);
});
```

## Server → Client (ViteRpcServer)

```typescript
// In server.ts setupServer
// IMPORTANT: payload type is always unknown, use type assertion
rpc.handle('plugin:method', async (payload: unknown) => {
  const data = payload as { key: string };
  return { result: 'data' };
});

// Broadcast to all clients
rpc.broadcast('plugin:update', { data: 'value' });
```

## App → Client (AppBridge)

```typescript
// In app.ts
const bridge = new AppBridge('plugin-name');
bridge.send('event', { data: 'value' });

// In client.ts
const bridge = new AppBridge('plugin-name');
bridge.on('event', (data) => {
  console.log(data);
});

// Cleanup
bridge.close();
```

## Error Handling

Always wrap RPC calls in try/catch:

```typescript
try {
  const result = await api.rpc.call('method', payload);
} catch (error) {
  api.notify(`Error: ${error}`, 'error');
}
```

## Naming Conventions

- RPC methods: `{plugin-name}:{action}` (e.g., `i18n:saveTranslation`)
- Events: `{plugin-name}:{event}` (e.g., `network:request-start`)
- Use kebab-case for consistency

## Type Safety

- Server RPC handlers receive `payload: unknown` - always use type assertions
- Client RPC calls should specify expected return types when possible
- Use TypeScript interfaces for payload and response types
