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
const result = await api.rpc.call('plugin:method', { data: 'value' });

// Subscribe to events
const unsubscribe = api.rpc.on('plugin:event', (data) => {
  console.log(data);
});
```

## Server → Client (ViteRpcServer)

```typescript
// In server.ts setupServer
rpc.handle('plugin:method', async (payload) => {
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

