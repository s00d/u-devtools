[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-security

# @u-devtools/plugin-security

Security Auditor plugin for Universal DevTools. Scans your application for security vulnerabilities, exposed secrets, and misconfigurations.

## Features

- **Environment Variable Scanning**: Detects exposed secrets in `import.meta.env` (VITE_* variables)
- **HTTP Headers Audit**: Checks for missing security headers (CSP, X-Frame-Options, etc.)
- **Storage Inspection**: Identifies sensitive data stored in LocalStorage or cookies
- **Dependency Audit**: Runs `npm audit` (or pnpm/yarn) to check for vulnerable packages
- **Secret Detection**: Uses regex patterns to find AWS keys, API tokens, private keys, and more

## Installation

```bash
npm install -D @u-devtools/plugin-security
# or
pnpm add -D @u-devtools/plugin-security
# or
yarn add -D @u-devtools/plugin-security
```

## Usage

Add the plugin to your Vite config:

```typescript
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { securityPlugin } from '@u-devtools/plugin-security';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        securityPlugin(),
      ],
    }),
  ],
});
```

## How It Works

1. **Browser-side scanning** (`app.ts`):
   - Scans `import.meta.env` for exposed secrets
   - Checks HTTP headers via HEAD request
   - Inspects LocalStorage and cookies for sensitive data

2. **Server-side audit** (`node.ts`):
   - Runs `npm audit --json` (or equivalent for pnpm/yarn)
   - Parses vulnerability reports
   - Returns structured data to the UI

3. **UI** (`SecurityPanel.vue`):
   - Displays issues grouped by severity
   - Shows recommendations for each issue
   - Provides summary statistics

## Issue Categories

- **env**: Exposed environment variables
- **headers**: Missing or misconfigured security headers
- **dependencies**: Vulnerable npm packages
- **storage**: Sensitive data in browser storage
- **scripts**: Inline scripts or unsafe practices

## Severity Levels

- **critical**: Immediate security risk (e.g., exposed AWS keys)
- **high**: Significant vulnerability
- **medium**: Moderate risk
- **low**: Minor issue or best practice violation
- **info**: Informational notice

## License

MIT

## Variables

- [plugin](variables/plugin.md)

## Functions

- [securityPlugin](functions/securityPlugin.md)
