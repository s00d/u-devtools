# Universal DevTools Plugins

This directory contains plugins for Universal DevTools Kit. Plugins are divided into two categories:

## Universal Plugins

These plugins work with any framework or no framework at all:

- **@u-devtools/plugin-i18n** - i18n file editor (works with any i18n library)
- **@u-devtools/plugin-network** - Network request logger (works everywhere)
- **@u-devtools/plugin-inspector** - DOM element inspector (universal, with framework component detection)
- **@u-devtools/plugin-terminal** - Terminal command runner (Node.js)
- **@u-devtools/plugin-storage** - LocalStorage/SessionStorage/Cookies manager
- **@u-devtools/plugin-package-inspector** - Package.json dependency viewer
- **@u-devtools/plugin-console** - Console log interceptor

## Framework-Specific Plugins

These plugins require a specific framework:

- **@u-devtools/plugin-vue-router** - Vue Router inspector (Vue only)
- **@u-devtools/plugin-vue-pinia** - Pinia state inspector (Vue only, planned)

## Naming Convention

- **Universal plugins**: `@u-devtools/plugin-{name}`
- **Framework-specific plugins**: `@u-devtools/plugin-{framework}-{name}`

Examples:
- `@u-devtools/plugin-network` (universal)
- `@u-devtools/plugin-vue-router` (Vue-specific)
- `@u-devtools/plugin-react-router` (React-specific, if created)

## Icon Guidelines

- **Universal plugins**: Use neutral icons (Carbon Design System)
- **Vue plugins**: Use `i-carbon-logo-vue` or Vue-themed icons
- **React plugins**: Use `i-carbon-logo-react` or React-themed icons

## Color Guidelines

- **Universal plugins**: Gray, blue, indigo colors
- **Vue plugins**: Green accents (Vue Green #42b883)
- **React plugins**: Blue accents (React Blue #61dafb)

