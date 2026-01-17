/**
 * Type declarations for optional dependencies
 * These are used for cross-framework support but are not required
 */

declare module 'react' {
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export default any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(element: any): void;
    unmount(): void;
  };
}

declare module 'react-dom' {
  export function render(element: any, container: Element | DocumentFragment): void;
  const defaultExport: {
    render: (element: any, container: Element | DocumentFragment) => void;
  };
  export default defaultExport;
}

declare module 'svelte' {
  export function mount(component: any, options: { target: Element; props?: any }): any;
}

declare module 'solid-js' {
  export function createComponent(component: any, props: any): any;
}

declare module 'solid-js/web' {
  export function render(fn: () => any, container: Element): () => void;
}
