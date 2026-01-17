---
to: <%= projectName %>/src/global.d.ts
---
// Type declarations for Web Components registered from Vue components
import 'solid-js';
import type { UDevToolsComponents } from '@u-devtools/ui';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements extends UDevToolsComponents {}
  }
}

