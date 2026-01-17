---
to: <%= projectName %>/src/global.d.ts
---
// Type declarations for Web Components registered from Vue components
import type { UDevToolsComponents } from '@u-devtools/ui';

declare namespace svelte.JSX {
  interface IntrinsicElements extends UDevToolsComponents {}
}

