// packages/client/src/mocks/plugins.ts
import type { PluginClientInstance } from '@u-devtools/core';

// В standalone режиме список плагинов может приходить через API
// или быть пустым по умолчанию.
// В реальности Electron сам скажет, какие плагины доступны.
export const plugins: PluginClientInstance[] = [];
