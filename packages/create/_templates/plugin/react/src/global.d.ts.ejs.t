---
to: <%= projectName %>/src/global.d.ts
---
// Type declarations for Web Components registered from Vue components
import type { DOMAttributes, RefObject } from 'react';
import type { UDevToolsComponents } from '@u-devtools/ui';

type CustomElement<T extends Record<string, any> = Record<string, any>> = Partial<T> &
  DOMAttributes<HTMLElement> & {
    children?: any;
    ref?: RefObject<HTMLElement>;
    class?: string;
    className?: string;
    style?: string;
    id?: string;
    [key: string]: any; // Allow any additional props
  };

declare global {
  namespace JSX {
    interface IntrinsicElements extends UDevToolsComponents {}
  }
}

export {};

