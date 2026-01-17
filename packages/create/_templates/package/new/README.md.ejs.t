---
to: <%= name %>/README.md
---
# <%= packageName || `@u-devtools/${name}` %>

[![npm version](https://img.shields.io/npm/v/<%= packageName || `@u-devtools/${name}` %>/latest?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName || `@u-devtools/${name}` %>)
[![npm downloads](https://img.shields.io/npm/dw/<%= packageName || `@u-devtools/${name}` %>?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName || `@u-devtools/${name}` %>)
[![License](https://img.shields.io/npm/l/<%= packageName || `@u-devtools/${name}` %>?style=for-the-badge)](https://www.npmjs.com/package/<%= packageName || `@u-devtools/${name}` %>)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

<%= description || 'A package for Universal DevTools' %>

## Usage

```ts
import { hello } from '<%= packageName || `@u-devtools/${name}` %>';

console.log(hello());
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck
```

## License

MIT

