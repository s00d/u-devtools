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

