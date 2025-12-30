# @u-devtools/kit

SDK for creating Universal DevTools plugins. Provides helper functions and utilities for plugin development.

## Installation

```bash
npm install -D @u-devtools/kit
```

## Usage

```ts
import { definePlugin } from '@u-devtools/kit';

export const myPlugin = () => definePlugin({
  name: 'My Plugin',
  root: import.meta.url,
  client: './client',
  // ...
});
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/packages/kit)

