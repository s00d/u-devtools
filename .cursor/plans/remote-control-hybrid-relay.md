# План реализации "Hybrid Relay" архитектуры

## Архитектура: Hub & Spoke

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Target App     │◄───────►│  Vite Server │◄───────►│  Tauri Desktop │
│  (Browser)      │  HMR    │   (Hub)      │  WS     │   (Remote)     │
│                 │         │              │         │                │
│  @u-devtools/   │         │  Relay Logic │         │  @u-devtools/  │
│  overlay        │         │              │         │  client        │
└─────────────────┘         └──────────────┘         └─────────────────┘
```

### Embedded Mode (Текущий)
- Client (Iframe) <-> BroadcastChannel <-> Overlay (Page)
- Client <-> HMR <-> Server

### Standalone Mode (Новый)
- Standalone App (Tauri) <-> WebSocket <-> Server (Node.js)
- Overlay (Page) <-> HMR <-> Server (Node.js)
- Server выступает как Ретранслятор (Relay) между Standalone App и Overlay

## Этапы реализации

### 1. Абстракция транспорта (@u-devtools/core)

**1.1. Создать интерфейс BridgeTransport**

**Файл:** `packages/core/src/bridge-transport.ts`

```typescript
export interface BridgeTransport {
  send(event: string, data: any): void;
  on(event: string, cb: (data: any) => void): () => void;
  close?(): void;
}
```

**1.2. Обновить BroadcastTransport для реализации интерфейса**

**Файл:** `packages/core/src/transports/broadcast-transport.ts`

- Добавить реализацию `BridgeTransport`
- Метод `close()` уже существует

**1.3. Создать RelayTransport (для Standalone режима)**

**Файл:** `packages/core/src/transports/relay-transport.ts`

- Использует `RpcClientInterface` для отправки/получения сообщений
- Отправляет события через `rpc.call('bridge:relay', { namespace, event, data })`
- Слушает события через `rpc.on('bridge:relay', ...)`
- Работает только для событий (send/on), не поддерживает RPC call

**1.4. Создать HybridTransport (для Overlay)**

**Файл:** `packages/core/src/transports/hybrid-transport.ts`

- Комбинирует `BroadcastTransport` и `RelayTransport`
- Отправляет сообщения И в BroadcastChannel (для Embedded), И через RPC (для Standalone)
- Слушает события от обоих источников

**1.5. Обновить AppBridge для работы с любым транспортом**

**Файл:** `packages/core/src/bridge-app.ts`

- Конструктор принимает либо `string` (namespace для обратной совместимости), либо `BridgeTransport`
- Если передан `string` → создает `BroadcastTransport` (текущее поведение)
- Если передан `BridgeTransport` → использует его напрямую
- Все методы (`send`, `on`, `request`) работают через `this.transport`

### 2. Настройка Сервера как Хаба (@u-devtools/vite)

**Файл:** `packages/vite/src/index.ts`

**2.1. Добавить отслеживание подключенных клиентов**

- Создать `Map<WebSocket, { type: 'browser' | 'desktop', rpc: ViteRpcServer }>`
- При подключении клиент отправляет `sys:handshake` с `{ type: 'browser' | 'desktop' }`
- Сервер сохраняет тип клиента в мапе

**2.2. Реализовать relay обработчик**

- Добавить `rpcServer.handle('bridge:relay', (payload) => { ... })`
- `payload: { namespace: string, event: string, data: any }`
- Рассылать `bridge:relay` всем подключенным клиентам через `rpcServer.broadcast()`
- Клиенты сами отфильтруют нужные сообщения по namespace

**2.3. Обновить ViteRpcServer для поддержки множественных клиентов**

**Файл:** `packages/bridge/src/index.ts`

- Текущая реализация уже поддерживает множественные соединения через `ws.on('message')`
- Убедиться, что `broadcast` отправляет сообщения всем подключенным клиентам

### 3. Рефакторинг Client (@u-devtools/client)

**3.1. Создать функцию-фабрику для ClientApi**

**Файл:** `packages/client/src/modules/clientApi.ts`

- Удалить глобальные константы `systemApi` и `rpc`
- Создать функцию `createClientApi(rpc: RpcClientInterface, mode: 'embedded' | 'standalone')`
- Фабрика для создания мостов:
  - `embedded` → `new AppBridge(new BroadcastTransport(namespace))`
  - `standalone` → `new AppBridge(new RelayTransport(rpc, namespace))`
- Экспортировать `createBridge` функцию для использования плагинами

**3.2. Обновить main.ts для dependency injection**

**Файл:** `packages/client/src/main.ts`

- Экспортировать функцию `mountDevTools(selector: string, options?: { rpcUrl?: string })`
- Если передан `rpcUrl` → `standalone` режим, создаем `ViteRpcClient(undefined, rpcUrl)`
- Иначе → `embedded` режим, используем `ViteRpcClient(import.meta.hot)`
- Создаем `api` через `createClientApi(rpc, mode)`
- Провайдим `api` через `app.provide('api', api)`
- Автозапуск только если `!window.__UDEVTOOLS_STANDALONE_INIT__`

**3.3. Обновить PluginRenderer для использования createBridge**

**Файл:** `packages/client/src/components/PluginRenderer.vue`

- Получать `createBridge` из `api` (если доступен) или использовать дефолтный `new AppBridge()`

### 4. Обновление Overlay для работы через HybridTransport

**4.1. Обновить инициализацию плагинов в Overlay**

**Файл:** `packages/overlay/src/App.vue`

- Создать `ViteRpcClient` для overlay (через `import.meta.hot`)
- При создании bridge для плагинов использовать `HybridTransport`:
  ```typescript
  const rpc = new ViteRpcClient(import.meta.hot);
  const bridge = new AppBridge(new HybridTransport(p.name, rpc));
  ```

**4.2. Обновить Launcher для использования HybridTransport**

**Файл:** `packages/overlay/src/components/Launcher.vue`

- Обновить `createBridge` для использования `HybridTransport`

### 5. Создание Standalone приложения (Tauri)

**5.1. Создать Tauri проект через pnpm create tauri-app**

**Команда:**
```bash
cd packages
pnpm create tauri-app desktop --template vue-ts
```

**5.2. Интегрировать в workspace**

**Файл:** `packages/desktop/package.json`

- Добавить в `dependencies`:
  - `@u-devtools/client: workspace:*`
  - `@u-devtools/core: workspace:*`
  - `@u-devtools/bridge: workspace:*`
- Обновить `scripts` для работы с workspace

**5.3. Создать экран подключения**

**Файл:** `packages/desktop/src/App.vue`

- UI для ввода WebSocket URL (по умолчанию `ws://localhost:5173/__u-devtools-ws`)
- Кнопка "Connect"
- При подключении вызывать `mountDevTools('#devtools', { rpcUrl: url.value })`

**5.4. Обновить Tauri конфигурацию**

**Файл:** `packages/desktop/src-tauri/tauri.conf.json`

- Настроить размеры окна, разрешения и т.д.

**5.5. Добавить в root package.json**

**Файл:** `package.json` (root)

- Добавить скрипт `dev:desktop` для запуска Tauri приложения

## Детали реализации

### BridgeTransport интерфейс

```typescript
export interface BridgeTransport {
  send(event: string, data: any): void;
  on(event: string, cb: (data: any) => void): () => void;
  close?(): void;
}
```

### RelayTransport

- Конструктор: `(rpc: RpcClientInterface, namespace: string)`
- `send()`: вызывает `rpc.call('bridge:relay', { namespace, event, data })`
- `on()`: подписывается на `rpc.on('bridge:relay', ...)` и фильтрует по namespace
- Внутренняя мапа слушателей для локальной эмиссии событий

### HybridTransport

- Конструктор: `(namespace: string, rpc: RpcClientInterface)`
- Создает `BroadcastTransport` и `RelayTransport`
- `send()`: вызывает оба транспорта
- `on()`: подписывается на оба транспорта и объединяет события

### Relay протокол на сервере

- Событие: `bridge:relay`
- Payload: `{ namespace: string, event: string, data: any }`
- Сервер рассылает всем подключенным клиентам
- Клиенты фильтруют по `namespace`

### Handshake протокол

- Клиент отправляет: `sys:handshake` с `{ type: 'browser' | 'desktop' }`
- Сервер отвечает: `{ success: true, serverVersion: string }`
- Сервер сохраняет тип клиента для возможной будущей оптимизации

## Порядок выполнения

1. Создать интерфейс `BridgeTransport` и обновить `BroadcastTransport`
2. Создать `RelayTransport` в `packages/core`
3. Создать `HybridTransport` в `packages/core`
4. Обновить `AppBridge` для работы с любым транспортом
5. Добавить relay логику в `packages/vite` (handshake + bridge:relay)
6. Рефакторить `packages/client` для dependency injection
7. Обновить `packages/overlay` для использования `HybridTransport`
8. Создать Tauri проект через `pnpm create tauri-app`
9. Интегрировать Tauri в workspace
10. Создать UI подключения в `packages/desktop`
11. Протестировать оба режима (Embedded и Standalone)

## Важные моменты

- **Обратная совместимость**: Существующие плагины работают без изменений
- **Автоматическое определение**: AppBridge автоматически выбирает транспорт
- **Двойная отправка в Hybrid**: Overlay отправляет и в BroadcastChannel, и через RPC (для поддержки обоих режимов одновременно)
- **Единый код плагинов**: Плагины не знают о режиме работы, используют только `bridge.send()` и `bridge.on()`
- **Relay работает только для событий**: RPC вызовы идут напрямую через WebSocket, не через relay
