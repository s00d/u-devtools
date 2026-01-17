[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/utils-node

# @u-devtools/utils-node

[![npm version](https://img.shields.io/npm/v/@u-devtools/utils-node/latest?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils-node)
[![npm downloads](https://img.shields.io/npm/dw/@u-devtools/utils-node?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils-node)
[![License](https://img.shields.io/npm/l/@u-devtools/utils-node?style=for-the-badge)](https://www.npmjs.com/package/@u-devtools/utils-node)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

Node.js-specific utility functions for Universal DevTools. Includes path resolution and file system helpers.

## Installation

```bash
npm install -D @u-devtools/utils-node
```

## Usage

```ts
import { safeResolve } from '@u-devtools/utils-node';

const path = safeResolve('./file.ts');
```

## Repository

[GitHub](https://github.com/s00d/u-devtools/tree/main/packages/utils-node)

## Classes

- [FileSystemService](classes/FileSystemService.md)

## Interfaces

- [InstallOptions](interfaces/InstallOptions.md)
- [PackageManagerInfo](interfaces/PackageManagerInfo.md)
- [UpdateOptions](interfaces/UpdateOptions.md)

## Type Aliases

- [PackageManager](type-aliases/PackageManager.md)

## Functions

- [buildAuditCommand](functions/buildAuditCommand.md)
- [buildInstallCommand](functions/buildInstallCommand.md)
- [buildUninstallCommand](functions/buildUninstallCommand.md)
- [buildUpdateCommand](functions/buildUpdateCommand.md)
- [detectPackageManager](functions/detectPackageManager.md)
- [executeCommand](functions/executeCommand.md)
- [executeManagerCommand](functions/executeManagerCommand.md)
- [normalizePath](functions/normalizePath.md)
- [safeResolve](functions/safeResolve.md)
