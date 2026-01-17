[**Universal DevTools Kit SDK**](../../../README.md)

***

[Universal DevTools Kit SDK](../../../packages.md) / [@u-devtools/utils-node](../README.md) / FileSystemService

# Class: FileSystemService

Defined in: [file-system.ts:35](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L35)

File system service for safe file operations within a project root.

## Example

```typescript
import { FileSystemService } from '@u-devtools/utils-node';

const fs = new FileSystemService('/path/to/project');

// Read file
const content = await fs.read('path/to/file.txt');

// Read JSON
const data = await fs.readJson('path/to/data.json');

// Write file
await fs.write('path/to/file.txt', content);

// Write JSON
await fs.writeJson('path/to/data.json', data, 2); // 2 = indentation

// Read directory
const entries = await fs.readdir('path/to/dir', { withFileTypes: true });

// Create directory
await fs.mkdir('path/to/dir', true); // true = recursive
```

## Constructors

### Constructor

> **new FileSystemService**(`root`): `FileSystemService`

Defined in: [file-system.ts:36](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L36)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `root` | `string` |

#### Returns

`FileSystemService`

## Methods

### access()

> **access**(`filePath`): `Promise`\<`void`\>

Defined in: [file-system.ts:116](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L116)

Проверка доступа к файлу (аналог fs.access).
Выбрасывает ошибку, если файл недоступен.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`Promise`\<`void`\>

***

### exists()

> **exists**(`filePath`): `boolean`

Defined in: [file-system.ts:103](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L103)

Проверка существования файла/директории.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`boolean`

***

### mkdir()

> **mkdir**(`dirPath`, `recursive`): `Promise`\<`void`\>

Defined in: [file-system.ts:129](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L129)

Создание директории (рекурсивно).

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `dirPath` | `string` | `undefined` |
| `recursive` | `boolean` | `true` |

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await fs.mkdir('path/to/dir', true); // true = recursive
```

***

### read()

> **read**(`filePath`): `Promise`\<`string`\>

Defined in: [file-system.ts:46](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L46)

Безопасное чтение файла. Выбрасывает ошибку, если путь выходит за пределы root.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`Promise`\<`string`\>

#### Example

```typescript
const content = await fs.read('path/to/file.txt');
```

***

### readdir()

> **readdir**(`dirPath`, `options?`): `Promise`\<`string`[] \| `Dirent`\<`string`\>[]\>

Defined in: [file-system.ts:142](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L142)

Чтение директории.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dirPath` | `string` |
| `options?` | \{ `withFileTypes?`: `boolean`; \} |
| `options.withFileTypes?` | `boolean` |

#### Returns

`Promise`\<`string`[] \| `Dirent`\<`string`\>[]\>

#### Example

```typescript
const entries = await fs.readdir('path/to/dir', { withFileTypes: true });
```

***

### readJson()

> **readJson**\<`T`\>(`filePath`): `Promise`\<`T` \| `null`\>

Defined in: [file-system.ts:59](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L59)

Безопасное чтение JSON.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`Promise`\<`T` \| `null`\>

#### Example

```typescript
const data = await fs.readJson('path/to/data.json');
```

***

### remove()

> **remove**(`filePath`): `Promise`\<`void`\>

Defined in: [file-system.ts:153](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L153)

Удаление файла или директории.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`Promise`\<`void`\>

***

### stat()

> **stat**(`filePath`): `Promise`\<`Stats`\>

Defined in: [file-system.ts:167](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L167)

Получение информации о файле/директории.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

#### Returns

`Promise`\<`Stats`\>

***

### write()

> **write**(`filePath`, `content`): `Promise`\<`void`\>

Defined in: [file-system.ts:76](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L76)

Безопасная запись файла. Автоматически создает директории.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `content` | `string` |

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await fs.write('path/to/file.txt', content);
```

***

### writeJson()

> **writeJson**(`filePath`, `data`, `indent`): `Promise`\<`void`\>

Defined in: [file-system.ts:95](https://github.com/s00d/u-devtools/blob/7cf3bd4421382e175ecee9dc3ffd84c28e30244d/packages/utils-node/src/file-system.ts#L95)

Безопасная запись JSON файла. Автоматически создает директории.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `filePath` | `string` | `undefined` |
| `data` | `unknown` | `undefined` |
| `indent` | `number` | `2` |

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await fs.writeJson('path/to/data.json', data, 2); // 2 = indentation
```
