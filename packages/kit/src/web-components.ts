import { h, render, reactive, defineComponent, type Component, type VNode } from 'vue';

/**
 * Helper to convert kebab-case to camelCase
 */
function camelize(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

type SlotContent = string | HTMLElement | HTMLElement[] | Node | Node[];
type SlotsMap = Record<string, SlotContent>;

interface MountOptions<P = any> {
  props?: P;
  slots?: SlotsMap;
  attrs?: Record<string, string | number | boolean>;
}

interface VueInstance<P = any> {
  update(newOptions: Partial<MountOptions<P>>): void;
  destroy(): void;
  el: HTMLElement;
}

// --- SLOT BRIDGE ---
// Optimized bridge for slots
const VanillaSlotBridge = defineComponent({
  props: ['name', 'content'],
  setup(props) {
    return () =>
      h('div', {
        'data-slot': props.name,
        style: { display: 'contents' },
        ref: (el) => {
          const element = el as HTMLElement;
          if (!element) return;

          // Simple check to avoid re-rendering DOM if content is the same (by reference)
          // For more complex cases, Vue will handle VNode diffing
          if ((element as any)._lastContent === props.content) return;
          (element as any)._lastContent = props.content;

          element.innerHTML = '';
          const content = props.content;
          if (!content) return;

          if (typeof content === 'string') {
            element.innerHTML = content;
          } else if (Array.isArray(content)) {
            content.forEach((node) => {
              if (node instanceof Node) element.appendChild(node);
            });
          } else if (content instanceof Node) {
            element.appendChild(content);
          }
        },
      });
  },
});

function mountVue<P = any>(
  Component: Component,
  target: HTMLElement,
  options: MountOptions<P> = {}
): VueInstance<P> {
  const state = reactive({
    props: options.props || ({} as any),
    attrs: options.attrs || {},
    slots: options.slots || {},
  });

  const vnodeFactory = () => {
    const vueSlots: Record<string, () => VNode> = {};
    for (const [name, content] of Object.entries(state.slots)) {
      vueSlots[name] = () =>
        h(VanillaSlotBridge, {
          name,
          content: content as any,
        });
    }
    const combinedProps = { ...state.props, ...state.attrs };
    return h(Component, combinedProps, vueSlots);
  };

  const app = h({
    setup() {
      return vnodeFactory;
    },
  });

  render(app, target);

  return {
    update({ props, slots, attrs }) {
      if (props) Object.assign(state.props, props);
      if (attrs) Object.assign(state.attrs, attrs);
      if (slots) Object.assign(state.slots, slots);
    },
    destroy() {
      render(null, target);
    },
    el: target,
  };
}

export interface DefineElementOptions {
  /**
   * List of attributes to observe.
   * Changes to these attributes will automatically update Vue props.
   * Example: ['label', 'is-active']
   */
  attributes?: string[];

  /**
   * List of events the Vue component emits.
   * These will be forwarded as standard DOM CustomEvents.
   * Example: ['change', 'update:modelValue']
   */
  emits?: string[];
}

/**
 * Registers a Vue component as a standard Web Component (Custom Element).
 * This allows the component to be used in React, Angular, CMSs, or plain HTML.
 *
 * Key Features:
 * - Attribute & Property Sync: Automatically maps HTML attributes to Vue props
 * - Complex Data Support: Use `.props` property for objects/arrays/functions
 * - Event Forwarding: Vue events become standard DOM CustomEvents
 * - Slot Bridge: Initial HTML content becomes Vue default slot
 * - Light DOM: No Shadow DOM, ensuring Tailwind CSS works perfectly
 *
 * @example
 * ```typescript
 * import { defineVueElement } from '@u-devtools/kit/web-components';
 * import { UButton } from '@u-devtools/ui';
 * 
 * // Define a Vue component as a Web Component
 * defineVueElement('u-button', UButton, {
 *   attributes: ['label', 'variant', 'icon', 'disabled'],
 *   emits: ['click', 'update:modelValue'],
 * });
 * 
 * // Now you can use it in HTML
 * // <u-button label="Click Me" variant="primary"></u-button>
 * 
 * // Or in React
 * // <u-button label="Click Me" variant="primary" />
 * 
 * // Example: Using props property for complex data
 * const button = document.querySelector('u-button') as any;
 * button.props = {
 *   onClick: () => console.log('Clicked!'),
 *   customData: { id: 1, name: 'test' },
 * };
 * 
 * // Example: Listening to events
 * button.addEventListener('click', (e: CustomEvent) => {
 *   console.log('Button clicked:', e.detail);
 * });
 * ```
 * 
 * @example
 * ```ts
 * import { defineVueElement } from '@u-devtools/kit';
 * import { UButton } from '@u-devtools/ui';
 *
 * defineVueElement('u-button', UButton, {
 *   attributes: ['label', 'variant', 'icon'],
 *   emits: ['click']
 * });
 * ```
 *
 * ```html
 * <u-button label="Click Me" variant="primary"></u-button>
 *
 * <script>
 *   const btn = document.querySelector('u-button');
 *   btn.addEventListener('click', (e) => console.log('Clicked!', e.detail));
 *   btn.props = { onClick: () => console.log('Programmatic handler') };
 * </script>
 * ```
 */
export function defineVueElement(
  tagName: string,
  VueComponent: Component,
  options: DefineElementOptions = {}
) {
  // Prevent double registration (silently skip if already registered)
  if (customElements.get(tagName)) {
    return;
  }

  class VueCustomElement extends HTMLElement {
    private _instance: VueInstance | null = null;
    private _props: Record<string, any> = {};
    private _initialSlots: SlotsMap = {};
    private _isDisconnecting = false; // Flag for handling DOM movement

    constructor() {
      super();
    }

    static get observedAttributes() {
      return options.attributes || [];
    }

    // Improved type casting (as in Vue docs)
    private _castValue(value: string | null): any {
      if (value === null) return undefined;
      if (value === '') return true; // <my-el disabled> -> true
      if (value === 'true') return true;
      if (value === 'false') return false;
      // Try to parse number, but carefully (so "123px" stays a string)
      const num = Number(value);
      if (
        !Number.isNaN(num) &&
        value.trim() !== '' &&
        !value.endsWith('px') &&
        !value.endsWith('%')
      ) {
        return num;
      }
      return value;
    }

    private _getEventHandlers() {
      const handlers: Record<string, any> = {};

      if (options.emits) {
        options.emits.forEach((event) => {
          // Vue events: update:modelValue -> onUpdate:modelValue
          // Regular: click -> onClick
          const camelEvent = camelize(event);
          const handlerName = event.startsWith('update:')
            ? `onUpdate:${camelEvent.slice(7)}` // Remove 'Update' from the beginning of camelized string
            : `on${camelEvent.charAt(0).toUpperCase() + camelEvent.slice(1)}`;

          handlers[handlerName] = (...args: any[]) => {
            // Prevent native DOM events from bubbling up by stopping propagation
            // Only dispatch CustomEvent for Vue-emitted events
            const customEvent = new CustomEvent(event, {
              detail: args.length > 1 ? args : args[0],
              bubbles: true, // Important for React (delegation)
              composed: true, // Important for Shadow DOM (if we ever use it)
              cancelable: true,
            });
            // Mark as custom event to distinguish from native DOM events
            (customEvent as any)._isVueEvent = true;
            this.dispatchEvent(customEvent);
          };
        });
      }
      return handlers;
    }

    private _mount() {
      if (this._instance) return;

      // Capture content for default slot (Light DOM children)
      if (this.childNodes.length > 0) {
        // Clone or move nodes
        this._initialSlots = {
          default: Array.from(this.childNodes),
        };
        // Clear innerHTML before mount to prevent duplication
        // Vue render() will overwrite it, but better to keep container clean
        this.innerHTML = '';
      }

      // Collect attributes
      const attrProps: Record<string, any> = {};
      (options.attributes || []).forEach((attr) => {
        if (this.hasAttribute(attr)) {
          attrProps[camelize(attr)] = this._castValue(this.getAttribute(attr));
        }
      });

      const eventHandlers = this._getEventHandlers();

      // Priority:
      // 1. Programmatic .props (passed from JS)
      // 2. Attributes (from HTML)
      // 3. Event handlers (auto-generated)
      const finalProps = {
        ...eventHandlers,
        ...attrProps,
        ...this._props,
      };

      this._instance = mountVue(VueComponent, this, {
        props: finalProps,
        slots: this._initialSlots,
      });
    }

    connectedCallback() {
      this._isDisconnecting = false;
      // Use requestAnimationFrame or nextTick to give time
      // for framework (React) to set .props before first render
      if (!this._instance) {
        // requestAnimationFrame ensures we don't block the thread
        requestAnimationFrame(() => this._mount());
      }
    }

    disconnectedCallback() {
      this._isDisconnecting = true;

      // IMPORTANT: Delayed destruction.
      // If element is just moved in DOM, connectedCallback will be called
      // again in the same tick or next microtask.
      setTimeout(() => {
        if (this._isDisconnecting && this._instance) {
          this._instance.destroy();
          this._instance = null;
        }
      }, 0);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (oldValue === newValue || !this._instance) return;
      this._instance.update({
        props: {
          [camelize(name)]: this._castValue(newValue),
        },
      });
    }

    /**
     * Programmatic API for passing complex data
     */
    set props(value: Record<string, any>) {
      this._props = { ...this._props, ...value };
      if (this._instance) {
        // When updating, merge with event handlers so we don't lose them
        const eventHandlers = this._getEventHandlers();
        this._instance.update({
          props: { ...eventHandlers, ...this._props },
        });
      }
    }

    get props() {
      return this._props;
    }
  }

  customElements.define(tagName, VueCustomElement);
}

/**
 * Helper to register multiple Vue components as Web Components
 *
 * @example
 * ```ts
 * import { defineVueElements } from '@u-devtools/kit';
 *
 * defineVueElements([
 *   { tagName: 'u-button', component: UButton, options: { attributes: ['label'], emits: ['click'] } },
 *   { tagName: 'u-card', component: UCard, options: { attributes: ['title'] } },
 * ]);
 * ```
 */
export function defineVueElements(
  definitions: Array<{
    tagName: string;
    component: Component;
    options?: DefineElementOptions;
  }>
) {
  definitions.forEach(({ tagName, component, options }) => {
    defineVueElement(tagName, component, options);
  });
}
