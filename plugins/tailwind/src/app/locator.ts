/**
 * Source Location Inspector
 * Extracts file path and line number from DOM elements using framework metadata
 */

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
}

/**
 * Get Vue 3 metadata from element
 * Vue 3 in dev mode often adds __file to component types
 */
function getVueMeta(el: HTMLElement): SourceLocation | null {
  // Method 1: Check for vite-plugin-vue-inspector data attribute
  const inspectorData = el.getAttribute('data-v-inspector');
  if (inspectorData) {
    const [file, line, col] = inspectorData.split(':');
    return {
      file: file || '',
      line: parseInt(line, 10) || 1,
      column: col ? parseInt(col, 10) : undefined,
    };
  }

  // Method 2: Check Vue instance properties
  const key = Object.keys(el).find((k) => k.startsWith('__vueParentComponent'));
  if (key) {
    // @ts-ignore
    const instance = el[key];
    if (instance?.vnode?.type) {
      const file = instance.vnode.type.__file;
      if (file) {
        return { file, line: 1 }; // Vue rarely gives exact line
      }
    }
  }

  // Method 3: Check for Vue devtools data
  // @ts-ignore
  if (el.__vueParentComponent) {
    // @ts-ignore
    const parent = el.__vueParentComponent;
    if (parent?.type?.__file) {
      return { file: parent.type.__file, line: 1 };
    }
  }

  return null;
}

/**
 * Get React 17+ metadata from element (Fiber)
 */
function getReactMeta(el: HTMLElement): SourceLocation | null {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
  if (key) {
    // @ts-ignore
    const fiber = el[key];
    if (fiber?._debugSource) {
      return {
        file: fiber._debugSource.fileName,
        line: fiber._debugSource.lineNumber,
        column: fiber._debugSource.columnNumber,
      };
    }
    // React 18+ might use different structure
    if (fiber?.return?._debugSource) {
      return {
        file: fiber.return._debugSource.fileName,
        line: fiber.return._debugSource.lineNumber,
        column: fiber.return._debugSource.columnNumber,
      };
    }
  }
  return null;
}

/**
 * Get Svelte metadata from element
 */
function getSvelteMeta(el: HTMLElement): SourceLocation | null {
  // @ts-ignore
  if (el.__svelte_meta?.loc) {
    // @ts-ignore
    return el.__svelte_meta.loc;
  }

  // Check for vite-plugin-svelte inspector data
  const svelteData = el.getAttribute('data-svelte-h');
  if (svelteData) {
    // Svelte inspector might add file info in data attributes
    const fileAttr = el.getAttribute('data-svelte-file');
    const lineAttr = el.getAttribute('data-svelte-line');
    if (fileAttr && lineAttr) {
      return {
        file: fileAttr,
        line: parseInt(lineAttr, 10),
      };
    }
  }

  return null;
}

/**
 * Universal function to get source location from any framework
 * Priority: Vite plugin locator (data-udt-loc) > Framework metadata > Parent elements
 */
export function getSourceLocation(el: HTMLElement): SourceLocation | null {
  if (!el) return null;

  // 1. PRIMARY: Check for data-udt-loc (injected by Vite plugin)
  // This is the most reliable method as it's injected at transform time
  // Format: "absolutePath:lineNumber"
  const udtLoc = el.getAttribute('data-udt-loc');
  if (udtLoc) {
    const lastColon = udtLoc.lastIndexOf(':');
    if (lastColon !== -1) {
      const file = udtLoc.substring(0, lastColon);
      const line = parseInt(udtLoc.substring(lastColon + 1), 10);
      if (!isNaN(line) && line > 0) {
        return {
          file,
          line,
        };
      }
    }
  }

  // 2. FALLBACK: Check parent elements for data-udt-loc
  // Sometimes we click on a child element (e.g., text node wrapper)
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 5) {
    const parentLoc = parent.getAttribute('data-udt-loc');
    if (parentLoc) {
      const lastColon = parentLoc.lastIndexOf(':');
      if (lastColon !== -1) {
        const file = parentLoc.substring(0, lastColon);
        const line = parseInt(parentLoc.substring(lastColon + 1), 10);
        if (!isNaN(line) && line > 0) {
          return {
            file,
            line,
          };
        }
      }
    }
    parent = parent.parentElement;
    depth++;
  }

  // 3. FALLBACK: Framework-specific metadata (for cases where Vite plugin didn't run)
  const reactMeta = getReactMeta(el);
  if (reactMeta) return reactMeta;

  const vueMeta = getVueMeta(el);
  if (vueMeta) return vueMeta;

  const svelteMeta = getSvelteMeta(el);
  if (svelteMeta) return svelteMeta;

  // 4. Check parent elements for framework metadata
  parent = el.parentElement;
  depth = 0;
  while (parent && depth < 5) {
    const reactParent = getReactMeta(parent);
    if (reactParent) return reactParent;

    const vueParent = getVueMeta(parent);
    if (vueParent) return vueParent;

    parent = parent.parentElement;
    depth++;
  }

  return null;
}

/**
 * Get source location and element info for RPC call
 */
export function getElementSourceInfo(el: HTMLElement): {
  source: SourceLocation | null;
  tagName: string;
  udtId: string;
} {
  const source = getSourceLocation(el);
  const udtId = el.getAttribute('data-udt-id') || '';
  return {
    source,
    tagName: el.tagName.toLowerCase(),
    udtId,
  };
}

