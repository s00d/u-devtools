# Архитектура Universal DevTools Kit

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [SDK пакеты](#sdk-пакеты)
3. [Плагины](#плагины)
4. [API Reference](#api-reference)
5. [Создание плагинов](#создание-плагинов)

---

## Обзор архитектуры

Universal DevTools Kit - это framework-agnostic система для создания инструментов разработчика. Проект состоит из трех основных слоев:

```
┌─────────────────────────────────────────────────────────┐
│  Node.js (Vite Server)                                  │
│  ┌──────────────┐  ┌──────────────────┐              │
│  │ Vite Plugin  │◄─┤ Plugin Server     │              │
│  │    Host      │  │     Logic        │              │
│  └──────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────┘
                        │
                        │ RPC (WebSocket через Vite HMR)
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Browser (Iframe) - DevTools UI                        │
│  ┌──────────────┐  ┌──────────────────┐              │
│  │ DevTools     │◄─┤ Plugin UI        │              │
│  │    Shell     │  │   Components     │              │
│  └──────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ BroadcastChannel
                        │
┌─────────────────────────────────────────────────────────┐
│  Browser (User App) - Window                           │
│  ┌──────────────┐  ┌──────────────────┐              │
│  │ App Runtime  │◄─┤ Plugin App       │              │
│  │              │  │     Logic        │              │
│  └──────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Три контекста выполнения

1. **Server (Node.js)** - Выполняется в процессе Vite Dev Server
   - Доступ к файловой системе
   - Чтение конфигурации Vite
   - Выполнение команд терминала
   - Работа с базами данных

2. **Client (Iframe)** - Изолированное Vue 3 приложение
   - UI плагинов
   - Управление состоянием
   - Взаимодействие с пользователем

3. **App (Window)** - Скрипты, инжектируемые в основное приложение
   - Перехват сетевых запросов
   - Инспекция DOM
   - Патчинг глобальных объектов (console, fetch, etc.)

---

## SDK пакеты

### 1. `@u-devtools/core` - Ядро системы

**Назначение:** Определяет все интерфейсы и типы для плагинов и клиента.

**Основные интерфейсы:**

#### `DevToolsPlugin`
Определяет структуру плагина на уровне сервера:
```typescript
interface DevToolsPlugin {
  name: string;                    // Имя плагина
  clientPath?: string;             // Путь к client.ts
  appPath?: string;                 // Путь к app.ts (инжектируется в window)
  setupServer?: (rpc, ctx) => void; // Серверная логика
  meta?: PluginMetadata;            // Метаданные (версия, описание)
}
```

#### `PluginClientInstance`
Определяет UI плагина:
```typescript
interface PluginClientInstance {
  name: string;
  icon: string;                     // Имя иконки из Heroicons
  
  settings?: PluginSettingsSchema;   // Схема настроек
  commands?: PluginCommand[];        // Команды для Command Palette
  
  renderMain?: (el, api) => UnmountFn;      // Основной вид
  renderSidebar?: (el, api) => UnmountFn;   // Боковая панель
  renderSettings?: (el, api) => UnmountFn;  // Кастомные настройки
}
```

#### `ClientApi`
API, доступное плагинам в клиенте:
```typescript
interface ClientApi {
  rpc: RpcClientInterface;          // RPC вызовы к серверу
  notify: (msg, type) => void;      // Уведомления
  storage: StorageApi;               // Локальное хранилище (scoped)
  settings: SettingsApi;             // Настройки плагина
  shortcuts: ShortcutApi;            // Горячие клавиши
  clipboard: ClipboardApi;            // Буфер обмена
  bus: EventBusApi;                  // Event Bus для межплагинного взаимодействия
  dialog: DialogApi;                 // Диалоги (confirm/prompt)
}
```

#### `AppBridge`
Класс для коммуникации между App и Client:
```typescript
class AppBridge {
  constructor(namespace: string);
  send(event: string, data?: any): void;
  on<T>(event: string, cb: (data: T) => void): () => void;
  close(): void;
}
```

**Использование:**
- В `app.ts`: `const bridge = new AppBridge('plugin-name'); bridge.send('event', data);`
- В `client.ts`: `const bridge = new AppBridge('plugin-name'); bridge.on('event', (data) => {...});`

---

### 2. `@u-devtools/bridge` - RPC мост

**Назначение:** Обеспечивает двустороннюю коммуникацию между Client и Server через Vite HMR.

**Классы:**

#### `ViteRpcClient` (Client → Server)
```typescript
class ViteRpcClient {
  constructor(hot: ViteHMR);
  call<T>(method: string, payload?: unknown): Promise<T>;
  on(event: string, fn: (data: unknown) => void): () => void;
  off(event: string, fn: (data: unknown) => void): void;
}
```

**Использование:**
```typescript
const rpc = new ViteRpcClient(import.meta.hot);
const result = await rpc.call('my-plugin:method', { data: 'value' });
const unsubscribe = rpc.on('my-plugin:event', (data) => console.log(data));
```

#### `ViteRpcServer` (Server → Client)
```typescript
class ViteRpcServer {
  constructor(ws: ViteWebSocket);
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;
  broadcast(event: string, payload?: unknown): void;
}
```

**Использование:**
```typescript
const rpc = new ViteRpcServer(server.ws);
rpc.handle('my-plugin:method', async (payload) => {
  return { result: 'data' };
});
rpc.broadcast('my-plugin:update', { data: 'value' });
```

**Протокол:**
- Запросы: `u-devtools:request` → `u-devtools:response`
- События: `u-devtools:event` (broadcast)

---

### 3. `@u-devtools/ui` - UI компоненты

**Назначение:** Набор переиспользуемых Vue компонентов для плагинов.

**Компоненты:**

| Компонент | Описание |
|-----------|----------|
| `UButton` | Кнопка с вариантами (primary, ghost, danger) и иконками |
| `UInput` | Текстовый input с поддержкой типов |
| `USelect` | Выпадающий список |
| `UForm` | Форма на основе схемы настроек |
| `UModal` | Модальное окно |
| `UTable` | Таблица с колонками и строками |
| `UTabs` | Вкладки |
| `USplitter` | Разделитель с изменяемым размером |
| `UBadge` | Бейдж/метка |
| `UIcon` | Иконка из Heroicons |
| `UCodeBlock` | Блок кода с подсветкой |
| `UJsonTree` | Дерево JSON |
| `UKeyValue` | Пара ключ-значение |
| `ULoading` | Индикатор загрузки |
| `UEmpty` | Пустое состояние |
| `UCard` | Карточка |
| `UStat` | Статистика |
| `UTabButtons` | Кнопки-вкладки |
| `UArrayInput` | Ввод массива |

**Стили:**
- Использует Tailwind CSS v4
- Темная тема по умолчанию
- CSS переменные для кастомизации (`--udt-primary`, `--udt-bg`, etc.)

---

### 4. `@u-devtools/client` - Клиентская оболочка

**Назначение:** Vue 3 приложение, которое рендерит DevTools UI в iframe.

**Структура:**

```
packages/client/src/
├── App.vue                    # Корневой компонент
├── index.ts                   # Точка входа
├── style.css                  # Глобальные стили
├── components/
│   ├── shell/
│   │   ├── ActivityBar.vue   # Левая панель (VS Code style)
│   │   ├── PluginSidebar.vue # Боковая панель плагина
│   │   └── MainView.vue       # Основная область
│   ├── AboutPanel.vue         # О плагине
│   ├── PluginManager.vue      # Менеджер плагинов
│   ├── CommandPalette.vue     # Командная палитра (Ctrl+K)
│   ├── GlobalDialogs.vue      # Глобальные диалоги
│   ├── PluginRenderer.vue    # Рендерер плагинов
│   └── settings/
│       └── SettingsModal.vue # Модалка настроек
├── composables/
│   ├── useDevToolsState.ts    # Глобальное состояние
│   ├── useNotifications.ts   # Уведомления
│   ├── usePluginStorage.ts    # Хранилище плагинов
│   └── useSettings.ts        # Настройки
└── modules/
    ├── clientApi.ts           # Фабрика ClientApi
    ├── settings.ts            # API настроек
    ├── shortcuts.ts           # Горячие клавиши
    ├── clipboard.ts           # Буфер обмена
    ├── bus.ts                 # Event Bus
    └── dialog.ts              # Диалоги
```

**Ключевые функции:**

#### `useDevToolsState()`
Централизованное состояние DevTools:
```typescript
const {
  plugins,              // Список плагинов
  activePluginId,        // Активный плагин
  showSettings,         // Показать настройки
  isPaletteOpen,        // Открыта ли палитра команд
  isSidebarExpanded,    // Развернут ли сайдбар
  currentPlugin,        // Текущий плагин
  isAboutActive,        // Активна ли панель About
  isManagerActive,      // Активен ли менеджер плагинов
  closeDevTools,        // Закрыть DevTools
  notifications         // Уведомления
} = useDevToolsState();
```

#### `createApiForPlugin(pluginName: string): ClientApi`
Создает изолированный API для плагина с собственным storage и settings scope.

#### `createSettingsApi(pluginName: string): SettingsApi`
Создает API настроек для плагина. Настройки сохраняются в `localStorage` с префиксом `{pluginName}:{key}`.

**Особенности:**
- Состояние сайдбара сохраняется в `localStorage`
- Настройки автоматически синхронизируются
- Уведомления показываются в правом нижнем углу
- Командная палитра открывается по `Ctrl+K` / `Cmd+K`

---

### 5. `@u-devtools/vite` - Vite плагин

**Назначение:** Интегрирует DevTools в Vite проект.

**Функция:** `createDevTools(options: DevToolsOptions): PluginOption`

**Опции:**
```typescript
interface DevToolsOptions {
  base?: string;           // Базовый путь для DevTools UI (default: '/__devtools')
  plugins?: DevToolsPlugin[]; // Список плагинов
  enabled?: boolean;       // Включить/выключить (default: true)
}
```

**Что делает плагин:**

1. **Создает виртуальные модули:**
   - `virtual:u-devtools-plugins` - Импортирует все `client.ts` плагинов
   - `virtual:u-devtools-app` - Инжектирует все `app.ts` скрипты

2. **Настраивает Dev Server:**
   - Создает RPC сервер через WebSocket
   - Регистрирует обработчики плагинов
   - Настраивает middleware для DevTools UI

3. **Инжектирует скрипты:**
   - Добавляет `<script type="module" src="virtual:u-devtools-app">` в `index.html`
   - Создает iframe для DevTools UI

4. **Регистрирует системные RPC методы:**
   - `sys:getPlugins` - Список плагинов
   - `sys:openFile` - Открыть файл в редакторе
   - `sys:plugins:list` - Список плагинов для менеджера
   - `sys:plugins:search` - Поиск плагинов в NPM
   - `sys:plugins:install` - Установка плагина
   - `sys:plugins:uninstall` - Удаление плагина

**Пример использования:**
```typescript
import { createDevTools } from '@u-devtools/vite';
import { i18nPlugin } from '@u-devtools/plugin-i18n';

export default defineConfig({
  plugins: [
    createDevTools({
      base: '/__devtools',
      plugins: [
        i18nPlugin({ dir: 'src/locales' })
      ]
    })
  ]
});
```

---

## Плагины

### 1. Console (`@u-devtools/plugin-console`)

**Назначение:** Перехватывает и логирует вызовы `console.*` методов.

**Структура:**
- `app.ts` - Патчит `console.log/warn/error/info/debug`
- `client.ts` - Определяет UI плагина
- `ui/ConsolePanel.vue` - Панель с логами

**Функционал:**
- Перехват всех методов console
- Фильтрация по типу (log/warn/error)
- Очистка логов
- Поиск по логам

**Настройки:**
- Нет настроек

**Команды:**
- `console.clear` - Очистить консоль

---

### 2. Network (`@u-devtools/plugin-network`)

**Назначение:** Перехватывает сетевые запросы (fetch, XMLHttpRequest).

**Структура:**
- `app.ts` - Патчит `window.fetch` и `XMLHttpRequest.prototype`
- `client.ts` - Определяет UI плагина
- `ui/NetworkPanel.vue` - Таблица запросов

**Функционал:**
- Перехват fetch и XHR
- Отображение URL, метода, статуса, времени выполнения
- Фильтрация по URL, методу, статусу
- Сохранение логов (preserve log)
- Лимит истории запросов

**Настройки:**
- `preserveLog` (boolean) - Сохранять логи при перезагрузке
- `maxRequests` (number) - Максимальное количество запросов в истории

**События AppBridge:**
- `request-start` - Начало запроса
- `request-end` - Завершение запроса
- `request-error` - Ошибка запроса

**Особенности:**
- Использует prototype proxying для надежного перехвата
- Поддерживает HMR cleanup через `import.meta.hot.dispose`

---

### 3. Inspector (`@u-devtools/plugin-inspector`)

**Назначение:** Инспекция DOM элементов на странице.

**Структура:**
- `app.ts` - Создает overlay и слушает события мыши/клавиатуры
- `client.ts` - Определяет UI плагина
- `ui/InspectorPanel.vue` - Панель с информацией об элементе

**Функционал:**
- Выделение элементов при наведении
- Клик для выбора элемента
- Отображение атрибутов, computed styles, текста
- Breadcrumbs навигация
- Открытие в редакторе (если доступно)

**События AppBridge:**
- `element-selected` - Элемент выбран

**Особенности:**
- Overlay создается в `document.body`
- Поддерживает HMR cleanup

---

### 4. Storage (`@u-devtools/plugin-storage`)

**Назначение:** Просмотр и редактирование LocalStorage, SessionStorage, Cookies.

**Структура:**
- `app.ts` - Патчит `Storage.prototype` и слушает события `storage`
- `client.ts` - Определяет UI плагина
- `ui/StoragePanel.vue` - Панель с хранилищами

**Функционал:**
- Просмотр LocalStorage, SessionStorage, Cookies
- Редактирование значений
- Удаление ключей
- Автообновление при изменениях
- Поиск по ключам

**События AppBridge:**
- `storage:update` - Обновление хранилища

**Особенности:**
- Использует polling (каждые 2 секунды) для обнаружения изменений
- Поддерживает HMR cleanup

---

### 5. Terminal (`@u-devtools/plugin-terminal`)

**Назначение:** Терминал для выполнения команд в Node.js окружении.

**Структура:**
- `server.ts` - Обработка команд через `child_process.spawn`
- `client.ts` - Определяет UI плагина
- `ui/TerminalPanel.vue` - Терминал с вводом и выводом

**Функционал:**
- Выполнение команд через shell
- Поддержка `cd` для смены директории
- История команд (стрелки вверх/вниз)
- Quick commands (быстрые команды)
- Настраиваемый размер шрифта

**RPC методы:**
- `term:execute` - Выполнить команду

**RPC события:**
- `term:data` - Вывод команды

**Настройки:**
- `quickCommands` (array) - Массив быстрых команд `{label, cmd}`
- `fontSize` (number) - Размер шрифта терминала

**Особенности:**
- Сохраняет текущую рабочую директорию между командами
- Поддерживает пайпы и редиректы через `shell: true`

---

### 6. Vue Inspector (`@u-devtools/plugin-vue-inspector`)

**Назначение:** Инспекция маршрутов Vue Router.

**Структура:**
- `app.ts` - Находит экземпляр Vue Router и подписывается на изменения
- `client.ts` - Определяет UI плагина
- `ui/RouterPanel.vue` - Панель с маршрутами

**Функционал:**
- Отображение текущего маршрута
- История навигации
- Список всех маршрутов
- Параметры и query параметры

**События AppBridge:**
- `router:change` - Изменение маршрута

**Особенности:**
- Работает только с Vue Router
- Автоматически находит router через `window.__VUE_ROUTER__` или `app.config.globalProperties.$router`

---

### 7. Package Inspector (`@u-devtools/plugin-package-inspector`)

**Назначение:** Просмотр зависимостей проекта из `package.json`.

**Структура:**
- `server.ts` - Чтение `package.json`
- `client.ts` - Определяет UI плагина
- `ui/PackagePanel.vue` - Панель с зависимостями

**Функционал:**
- Отображение зависимостей (dependencies, devDependencies)
- Поиск по пакетам
- Информация о версиях

**RPC методы:**
- `pkg:read` - Прочитать package.json

---

### 8. Vite Inspector (`@u-devtools/plugin-vite-inspector`)

**Назначение:** Диагностика и управление Vite конфигурацией.

**Структура:**
- `server.ts` - Доступ к Vite конфигурации и серверу
- `client.ts` - Определяет UI плагина
- `ui/ViteInspectorPanel.vue` - Панель с информацией о Vite

**Функционал:**
- Информация о версии Vite и Node.js
- Просмотр resolved конфигурации
- Список плагинов Vite
- Переменные окружения (VITE_*)
- Перезапуск сервера
- Очистка кэша

**RPC методы:**
- `vite:info` - Общая информация
- `vite:config` - Конфигурация
- `vite:plugins` - Список плагинов
- `vite:env` - Переменные окружения
- `vite:restart` - Перезапуск сервера
- `vite:clearCache` - Очистка кэша

**Особенности:**
- Использует `flatted` для сериализации циклических ссылок в конфиге
- Имеет доступ к `ViteDevServer` через `ServerContext`

---

### 9. i18n (`@u-devtools/plugin-i18n`)

**Назначение:** Визуальный редактор переводов для JSON файлов.

**Структура:**
- `server.ts` - Чтение/запись JSON файлов, отслеживание изменений через `chokidar`
- `client.ts` - Определяет UI плагина с кастомными настройками
- `ui/I18nPanel.vue` - Основная панель редактора
- `ui/I18nSettings.vue` - Кастомные настройки перевода
- `ui/TreeItem.vue` - Компонент дерева файлов
- `util/i18nUtils.ts` - Утилиты для flatten/unflatten переводов
- `util/Translator.ts` - Переводчик с поддержкой множества сервисов

**Функционал:**
- Дерево файлов локалей
- Редактор переводов с поиском
- Пагинация
- Статистика переводов
- Автоперевод недостающих ключей
- Экспорт/импорт JSON
- Открытие ключа в редакторе (с позицией)

**RPC методы:**
- `i18n:getLocalesAndTranslations` - Получить все файлы и переводы
- `i18n:getConfigs` - Получить конфигурацию модуля
- `i18n:saveTranslation` - Сохранить перевод в файл

**RPC события:**
- `i18n:locales-update` - Обновление файлов локалей

**Настройки:**
- `itemsPerPage` (number) - Количество элементов на странице
- `translationDriver` (select) - Сервис перевода (disabled/openai/google/deepl/etc.)
- `translationApiToken` (string) - API токен
- `translationFolderId` (string) - Yandex Cloud Folder ID
- `translationFormality` (select) - DeepL формальность
- `translationModel` (select) - Модель AI (для OpenAI/DeepSeek)

**Особенности:**
- Использует `json-to-ast` для определения позиций ключей в файле
- Поддерживает условное отображение настроек в зависимости от выбранного драйвера
- Переводчик поддерживает: Google, Google Free, Yandex, Yandex Cloud, DeepL, OpenAI, DeepSeek
- Автоматически сохраняет настройки перевода

**Опции плагина:**
```typescript
i18nPlugin({
  dir: 'src/locales',        // Директория с JSON файлами
  defaultLocale?: 'en',      // Локаль по умолчанию
  locales?: ['en', 'fr']     // Список локалей
})
```

---

## API Reference

### ClientApi

Полный API, доступный плагинам в клиенте:

#### `rpc: RpcClientInterface`
```typescript
// Вызов метода на сервере
const result = await api.rpc.call('plugin:method', { data: 'value' });

// Подписка на события
const unsubscribe = api.rpc.on('plugin:event', (data) => {
  console.log(data);
});
```

#### `notify: (msg: string, type?: 'info' | 'error' | 'success') => void`
```typescript
api.notify('Operation completed', 'success');
api.notify('Error occurred', 'error');
api.notify('Information', 'info');
```

#### `storage: StorageApi`
Изолированное хранилище для плагина:
```typescript
api.storage.set('key', 'value');
const value = api.storage.get('key', 'default');
api.storage.remove('key');
```

#### `settings: SettingsApi`
Настройки плагина (синхронизируются с UI):
```typescript
api.settings.set('key', 'value');
const value = api.settings.get('key', 'default');
const all = api.settings.all; // Реактивный объект всех настроек
```

#### `shortcuts: ShortcutApi`
Регистрация горячих клавиш:
```typescript
const unregister = api.shortcuts.register(['Meta', 'K'], () => {
  console.log('Shortcut pressed');
});
```

#### `clipboard: ClipboardApi`
Работа с буфером обмена:
```typescript
await api.clipboard.copy('text to copy', 'Copied!');
const text = await api.clipboard.read();
```

#### `bus: EventBusApi`
Межплагинное взаимодействие:
```typescript
// Отправить событие
api.bus.emit('my-event', { data: 'value' });

// Подписаться на событие
const unsubscribe = api.bus.on('my-event', (data) => {
  console.log(data);
});
```

#### `dialog: DialogApi`
Диалоги подтверждения и ввода:
```typescript
const confirmed = await api.dialog.confirm({
  title: 'Confirm',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No'
});

const input = await api.dialog.prompt({
  title: 'Input',
  message: 'Enter value:',
  defaultValue: 'default'
});
```

---

### RpcServerInterface

API для регистрации серверных методов:

```typescript
// Регистрация обработчика
rpc.handle('plugin:method', async (payload) => {
  return { result: 'data' };
});

// Broadcast события всем клиентам
rpc.broadcast('plugin:update', { data: 'value' });
```

---

### ServerContext

Контекст, передаваемый в `setupServer`:
```typescript
interface ServerContext {
  root: string;        // Корневая директория проекта
  server: unknown;     // ViteDevServer (можно привести к типу)
}
```

---

## Создание плагинов

### Шаг 1: Структура проекта

```
my-plugin/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── index.ts       # Экспорт DevToolsPlugin
    ├── server.ts      # (Опционально) Серверная логика
    ├── client.ts      # Определение PluginClientInstance
    ├── app.ts         # (Опционально) Скрипт для window
    └── ui/
        └── MyPanel.vue # Vue компонент
```

### Шаг 2: package.json

```json
{
  "name": "@u-devtools/plugin-my-plugin",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "type": "module",
  "dependencies": {
    "@u-devtools/core": "workspace:*"
  },
  "devDependencies": {
    "vue": "^3.5.26",
    "typescript": "^5.9.3"
  }
}
```

### Шаг 3: index.ts

```typescript
import type { DevToolsPlugin } from '@u-devtools/core';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupServer } from './server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const myPlugin = (options?: MyPluginOptions): DevToolsPlugin => ({
  name: 'My Plugin',
  clientPath: path.resolve(__dirname, './client.ts'),
  appPath: path.resolve(__dirname, './app.ts'), // Опционально
  setupServer: (rpc, ctx) => setupServer(rpc, ctx, options), // Опционально
  meta: {
    name: '@u-devtools/plugin-my-plugin',
    version: '0.1.0',
    description: 'My custom plugin'
  }
});
```

### Шаг 4: server.ts (Опционально)

```typescript
import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options?: MyPluginOptions
) {
  rpc.handle('my-plugin:method', async (payload) => {
    // Логика на сервере
    return { result: 'data' };
  });

  // Broadcast событий
  setInterval(() => {
    rpc.broadcast('my-plugin:update', { data: Date.now() });
  }, 1000);
}
```

### Шаг 5: client.ts

```typescript
import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import MyPanel from './ui/MyPanel.vue';

const plugin: PluginClientInstance = {
  name: 'My Plugin',
  icon: 'Cube', // Имя из Heroicons

  settings: {
    mySetting: {
      label: 'My Setting',
      type: 'string',
      default: 'default value'
    }
  },

  commands: [
    {
      id: 'my-plugin:action',
      label: 'Do Action',
      icon: 'Bolt',
      action: () => console.log('Action!')
    }
  ],

  renderMain(container, api) {
    const app = createApp(MyPanel, { api });
    app.mount(container);
    return () => app.unmount();
  },

  // Опционально: кастомные настройки
  renderSettings(container, api) {
    const app = createApp(MySettings, { api });
    app.mount(container);
    return () => app.unmount();
  }
};

export default plugin;
```

### Шаг 6: app.ts (Опционально)

```typescript
import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('my-plugin');

// Патчинг глобальных объектов
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const startTime = Date.now();
  const response = await originalFetch(...args);
  const duration = Date.now() - startTime;
  
  bridge.send('request', {
    url: args[0],
    duration,
    status: response.status
  });
  
  return response;
};

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.fetch = originalFetch;
    bridge.close();
  });
}
```

### Шаг 7: MyPanel.vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UInput } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();
const data = ref('');

async function fetchData() {
  data.value = await props.api.rpc.call('my-plugin:method', {});
  props.api.notify('Data loaded', 'success');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">My Plugin</h1>
    <UButton @click="fetchData">Load Data</UButton>
    <div v-if="data">{{ data }}</div>
  </div>
</template>
```

### Шаг 8: Использование в проекте

```typescript
import { createDevTools } from '@u-devtools/vite';
import { myPlugin } from '@u-devtools/plugin-my-plugin';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        myPlugin({ /* options */ })
      ]
    })
  ]
});
```

---

## Лучшие практики

### 1. HMR Cleanup

Всегда очищайте патчи и слушатели при HMR:
```typescript
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Восстановить оригинальные методы
    window.fetch = originalFetch;
    // Удалить слушатели
    document.removeEventListener('click', handler);
    // Закрыть bridge
    bridge.close();
  });
}
```

### 2. Изоляция Storage и Settings

Каждый плагин получает изолированный scope:
- Storage: `{pluginName}:{key}`
- Settings: `{pluginName}:{key}`

Не используйте глобальные ключи без префикса.

### 3. Обработка ошибок

Всегда обрабатывайте ошибки в RPC вызовах:
```typescript
try {
  const result = await api.rpc.call('method', payload);
} catch (error) {
  api.notify(`Error: ${error}`, 'error');
}
```

### 4. Реактивность настроек

Используйте `computed` для реактивного чтения настроек:
```typescript
const fontSize = computed(() => props.api.settings.get('fontSize', 14));
```

### 5. Условные настройки

Для сложных настроек используйте `renderSettings`:
```typescript
renderSettings(container, api) {
  const app = createApp(MySettings, { api });
  app.mount(container);
  return () => app.unmount();
}
```

---

## Виртуальные модули

Vite плагин создает два виртуальных модуля:

### `virtual:u-devtools-plugins`

Импортирует все `client.ts` файлы плагинов:
```typescript
import { plugins } from 'virtual:u-devtools-plugins';
// plugins - массив PluginClientInstance[]
```

### `virtual:u-devtools-app`

Инжектируется в `index.html` и загружает все `app.ts` скрипты:
```html
<script type="module" src="virtual:u-devtools-app"></script>
```

---

## Системные RPC методы

Доступны всем плагинам через `api.rpc.call()`:

- `sys:getPlugins` - Список плагинов
- `sys:openFile` - Открыть файл в редакторе
  ```typescript
  await api.rpc.call('sys:openFile', {
    file: 'src/App.vue',
    line: 10,
    column: 5
  });
  ```
- `sys:plugins:list` - Список для менеджера плагинов
- `sys:plugins:search` - Поиск в NPM
- `sys:plugins:install` - Установка плагина
- `sys:plugins:uninstall` - Удаление плагина

---

## Стилизация

### CSS переменные

Определены в `packages/ui/src/style.css`:
- `--udt-primary` - Основной цвет
- `--udt-primary-hover` - Hover состояние
- `--udt-bg` - Фон
- `--udt-bg-soft` - Мягкий фон
- `--udt-border` - Границы
- `--udt-text` - Текст
- `--udt-text-dim` - Приглушенный текст
- `--udt-radius` - Радиус скругления

### Темная тема

Тема всегда темная. CSS переменные автоматически меняются при добавлении класса `.dark` на `html`.

### Tailwind CSS

Используется Tailwind CSS v4 с кастомным вариантом:
```css
@variant dark (&:where(.dark, .dark *));
```

---

## Командная палитра

Открывается по `Ctrl+K` / `Cmd+K`. Показывает:
- Команды плагинов (из `commands`)
- Навигацию по плагинам
- Системные команды

---

## Менеджер плагинов

Позволяет:
- Просматривать установленные плагины
- Искать плагины в NPM (по ключевому слову `u-devtools-plugin`)
- Устанавливать плагины
- Удалять плагины

---

## Настройки

### Общие настройки (General)

- `scale` - Масштаб UI (0.85 - 1.25)
- `opacity` - Прозрачность панели (0.8 - 1.0)
- `notifications` - Включить уведомления
- `reducedMotion` - Уменьшить анимации

### Настройки плагинов

Каждый плагин может определить схему настроек в `settings`:
```typescript
settings: {
  mySetting: {
    label: 'My Setting',
    type: 'string' | 'number' | 'boolean' | 'select' | 'array',
    default: 'value',
    description: 'Optional description',
    options: [{ label: 'Option', value: 'opt' }] // Для select
  }
}
```

Для сложных настроек используйте `renderSettings`.

---

## Заключение

Universal DevTools Kit предоставляет мощную и гибкую архитектуру для создания инструментов разработчика. Ключевые преимущества:

- **Модульность**: Каждый плагин изолирован
- **Типобезопасность**: Полная поддержка TypeScript
- **Гибкость**: Три контекста выполнения (Server/Client/App)
- **Расширяемость**: Легко создавать новые плагины
- **UI Kit**: Готовые компоненты для быстрой разработки

Для начала работы с плагином изучите примеры в папке `plugins/` и следуйте структуре, описанной в этом документе.

