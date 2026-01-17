import type { SyncedState } from '@u-devtools/core';

/**
 * Cleanup function type (unsubscribe)
 */
export type CleanupFn = () => void;

/**
 * Reactive variable interface for Vanilla JS
 */
export interface VanillaRef<T> {
  /**
   * Current value. When assigned, automatically updates SyncedState.
   */
  value: T;
  /**
   * Unsubscribes from updates.
   */
  dispose: () => void;
}

/**
 * Binds element text content to state.
 * element.textContent = state.value
 * @param element - HTMLElement or Text node
 * @param state - SyncedState instance
 */
export function bindText(element: HTMLElement | Text, state: SyncedState<any>): CleanupFn {
  const update = (val: any) => {
    element.textContent = String(val ?? '');
  };
  // Initialize
  update(state.value);
  // Subscribe
  return state.subscribe(update);
}

/**
 * Binds element HTML content to state.
 * element.innerHTML = state.value
 * @param element - HTMLElement
 * @param state - SyncedState instance
 */
export function bindHtml(element: HTMLElement, state: SyncedState<any>): CleanupFn {
  const update = (val: any) => {
    element.innerHTML = String(val ?? '');
  };
  update(state.value);
  return state.subscribe(update);
}

/**
 * Toggles CSS class based on boolean state.
 * element.classList.toggle(className, !!state.value)
 * @param element - HTMLElement
 * @param state - SyncedState instance
 * @param className - CSS class name
 */
export function bindClass(
  element: HTMLElement, 
  state: SyncedState<any>, 
  className: string
): CleanupFn {
  const update = (val: any) => {
    if (val) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  };
  update(state.value);
  return state.subscribe(update);
}

/**
 * Controls element visibility (display: none).
 * visible = true -> removes display: none
 * visible = false -> sets display: none
 * @param element - HTMLElement
 * @param state - SyncedState instance
 */
export function bindVisible(element: HTMLElement, state: SyncedState<any>): CleanupFn {
  const originalDisplay = element.style.display;
  const update = (val: any) => {
    if (val) {
      element.style.display = originalDisplay === 'none' ? '' : originalDisplay;
    } else {
      element.style.display = 'none';
    }
  };
  update(state.value);
  return state.subscribe(update);
}

/**
 * Binds element attribute to state.
 * @param element - HTMLElement
 * @param state - SyncedState instance
 * @param attrName - Attribute name
 */
export function bindAttr(
  element: HTMLElement, 
  state: SyncedState<any>, 
  attrName: string
): CleanupFn {
  const update = (val: any) => {
    if (val === null || val === undefined || val === false) {
      element.removeAttribute(attrName);
    } else {
      element.setAttribute(attrName, val === true ? '' : String(val));
    }
  };
  update(state.value);
  return state.subscribe(update);
}

/**
 * Two-way binding for input, textarea, select elements.
 * state -> input.value
 * input event -> state.value
 * @param element - HTMLInputElement, HTMLTextAreaElement, or HTMLSelectElement
 * @param state - SyncedState instance
 */
export function bindInput(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  state: SyncedState<any>
): CleanupFn {
  // 1. State -> DOM
  const update = (val: any) => {
    // Avoid cursor reset if value hasn't changed
    if (element.type === 'checkbox' || element.type === 'radio') {
      (element as HTMLInputElement).checked = !!val;
    } else if (element.value !== String(val ?? '')) {
      element.value = String(val ?? '');
    }
  };

  // 2. DOM -> State
  const onInput = () => {
    let val: any;
    if (element.type === 'checkbox') {
      val = (element as HTMLInputElement).checked;
    } else if (element.type === 'number') {
      val = Number(element.value);
    } else {
      val = element.value;
    }
    state.value = val;
  };

  update(state.value);
  const unsub = state.subscribe(update);
  
  element.addEventListener('input', onInput);
  element.addEventListener('change', onInput); // For checkboxes/selects, change is more reliable

  return () => {
    unsub();
    element.removeEventListener('input', onInput);
    element.removeEventListener('change', onInput);
  };
}

/**
 * Style binding.
 * element.style[property] = state.value
 */
export function bindStyle(
  element: HTMLElement,
  state: SyncedState<any>,
  property: keyof CSSStyleDeclaration
): CleanupFn {
  const update = (val: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (element.style as any)[property] = val ? String(val) : '';
  };
  update(state.value);
  return state.subscribe(update);
}

/**
 * Vanilla JS equivalent of useBridgeState.
 * Creates a reactive variable with automatic synchronization.
 * 
 * @template T - State value type
 * @param syncedState - State from core (bridge.state(...))
 * @param onChange - (Optional) Effect function called on every change.
 *                   Called immediately on initialization (immediate: true).
 * @returns VanillaRef object with value and dispose
 * 
 * @example
 * ```typescript
 * const count = useBridgeState(bridge.state('cnt', 0), (val) => {
 *   button.textContent = `Count: ${val}`;
 * });
 * 
 * button.onclick = () => count.value++; // Updates both locally and in bridge
 * ```
 */
export function useBridgeState<T>(
  syncedState: SyncedState<T>,
  onChange?: (value: T) => void
): VanillaRef<T> {
  let cleanup = () => {};

  if (onChange) {
    // 1. Call effect immediately (initial render)
    onChange(syncedState.value);
    
    // 2. Subscribe to changes
    cleanup = syncedState.subscribe(onChange);
  }

  // 3. Return object with getter/setter
  return {
    get value() {
      return syncedState.value;
    },
    set value(v: T) {
      syncedState.value = v;
    },
    dispose: cleanup,
  };
}

