[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/utils

# @u-devtools/utils

[![npm version](https://img.shields.io/npm/v/@u-devtools/utils/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/utils?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils)
[![License](https://img.shields.io/npm/l/@u-devtools/utils?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Utility functions for Universal DevTools. Includes formatting, serialization, and color utilities.

## Installation

```bash
npm install -D @u-devtools/utils
```

## Usage

```ts
import { formatBytes, formatDuration, serialize } from '@u-devtools/utils';

const size = formatBytes(1024); // "1 KB"
const time = formatDuration(5000); // "5s"
const data = serialize(obj);
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/packages/utils)

## Type Aliases

- [StatusColor](type-aliases/StatusColor.md)

## Functions

- [extractErrorMessage](functions/extractErrorMessage.md)
- [formatDateTime](functions/formatDateTime.md)
- [formatDuration](functions/formatDuration.md)
- [formatTime](functions/formatTime.md)
- [getLevelColor](functions/getLevelColor.md)
- [getStatusColor](functions/getStatusColor.md)
- [normalizePath](functions/normalizePath.md)
- [safeJsonParse](functions/safeJsonParse.md)
- [safeJsonStringify](functions/safeJsonStringify.md)
- [safeLocalStorageGet](functions/safeLocalStorageGet.md)
- [safeLocalStorageSet](functions/safeLocalStorageSet.md)
- [serialize](functions/serialize.md)
