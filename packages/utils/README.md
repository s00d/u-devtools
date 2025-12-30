# @u-devtools/utils

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

