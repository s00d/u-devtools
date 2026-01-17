import {
  ref,
  computed,
  watch,
  toRefs,
  isRef,
  h,
  onUnmounted,
  useSlots,
  type WatchStopHandle,
  type Component,
  type DefineComponent,
  type VNode,
  type VNodeArrayChildren,
  type Ref,
} from 'vue';
import { createTextVNode, isVNode } from 'vue';
import type { ActionLog } from '../../types';

interface UseEnhancedPreviewProps {
  title?: string;
  name?: string;
  component: DefineComponent | string | unknown;
  modelValue?:
    | string
    | number
    | boolean
    | Record<string, unknown>
    | Array<unknown>
    | null
    | Ref<unknown>;
  props?: Record<string, unknown>;
  emits?: string[];
  listeners?: Record<string, (...args: unknown[]) => void>;
}

interface CodeGenOptions {
  fullVueFile?: boolean;
  kebabCase?: boolean;
  withComments?: boolean;
  eventNameToHandler?: Record<string, string>;
  specialDirectives?: Record<string, string>;
  slotProps?: Record<string, string[]>;
}

/** Utilities */

function getNodeTag(node: VNode): string {
  if (typeof node.type === 'symbol' && node.type.description === 'v-txt') {
    return '#text';
  }
  if (typeof node.type === 'string') {
    return node.type;
  }
  const comp = node.type as DefineComponent;
  return comp?.name || comp?.__name || 'AnonymousComponent';
}

function getVNodeChildrenArray(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return node.children
      .flatMap((child) => {
        if (Array.isArray(child)) {
          return child.map((item) => (isVNode(item) ? item : createTextVNode(String(item))));
        } else {
          return isVNode(child) ? child : createTextVNode(String(child));
        }
      });
  }

  if (typeof node.children === 'object' && node.children !== null) {
    const slots = node.children as Record<string, unknown>;
    if (typeof slots.default === 'function') {
      const slotResult = slots.default();
      return Array.isArray(slotResult)
        ? slotResult.map((item) => (isVNode(item) ? item : createTextVNode(String(item))))
        : isVNode(slotResult)
          ? [slotResult]
          : [createTextVNode(String(slotResult))];
    }
  }

  if (typeof node.children === 'string' || typeof node.children === 'number') {
    return [createTextVNode(String(node.children))];
  }

  return [];
}

function serializeVNode(node: VNode, depth = 0): string {
  if (!node) return '';
  const tagName = getNodeTag(node);
  const indent = '  '.repeat(depth);

  if (tagName === '#text') {
    return String(node.children) + '\n';
  }

  const childArray = getVNodeChildrenArray(node);

  const propsString = node.props
    ? Object.entries(node.props)
        .map(([key, val]) => {
          if (typeof val === 'string') {
            return ` ${key}="${val}"`;
          } else if (typeof val === 'number' || typeof val === 'boolean') {
            return ` :${key}="${val}"`;
          } else if (typeof val === 'function') {
            return ` :${key}="${val.toString()}"`;
          } else {
            return ` :${key}='${JSON.stringify(val)}'`;
          }
        })
        .join('')
    : '';

  if (childArray.length) {
    const childrenSerialized = childArray
      .map((child) => (isVNode(child) ? serializeVNode(child, depth + 1) : ''))
      .join('');
    return `${indent}<${tagName}${propsString}>${childrenSerialized}</${tagName}>\n`;
  } else {
    return `${indent}<${tagName}${propsString} />\n`;
  }
}

function serializeSlotVNodes(vnodes: VNodeArrayChildren): string {
  return vnodes.map((node) => (isVNode(node) ? serializeVNode(node) : '')).join('');
}

function prettyStringify(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function useEnhancedPreview(
  props: UseEnhancedPreviewProps,
  emit: (event: string, ...args: unknown[]) => void,
  options: CodeGenOptions = {}
) {
  const {
    fullVueFile = false,
    kebabCase = true,
    withComments = false,
    eventNameToHandler = {},
    specialDirectives = {},
    slotProps = {},
  } = options;

  const isFrozen = ref(false);
  const frozenCode = ref('');
  const actionLogs = ref<ActionLog[]>([]);

  const mergedProps = toRefs(props);
  const slots = useSlots();

  const logAction = (name: string, args: any[]) => {
    actionLogs.value.unshift({
      id: Math.random().toString(36).substr(2, 9),
      name,
      payload: args,
      timestamp: Date.now(),
    });
    // Limit logs
    if (actionLogs.value.length > 50) actionLogs.value.pop();
  };

  const clearLogs = () => {
    actionLogs.value = [];
  };

  const customEmits = computed(() => props.emits || []);
  const emitEvent = (eventName: string, ...args: unknown[]) => {
    if (customEmits.value.includes(eventName)) {
      emit(eventName, ...args);
    }
  };

  // Watch for v-model:xxx
  const stopWatcher: WatchStopHandle = watch(
    () => mergedProps.props?.value,
    (newProps) => {
      Object.entries(newProps ?? []).forEach(([key, value]) => {
        if (key.startsWith('v-model:')) {
          const eventName = 'update:' + key.replace('v-model:', '');
          emitEvent(eventName, value);
        }
      });
    },
    { deep: true }
  );

  // Form dynamicProps
  const dynamicProps = computed(() => {
    const processedProps: Record<string, unknown> = {
      ...mergedProps.props?.value,
    };

    // v-model (modelValue)
    if (mergedProps.modelValue?.value !== undefined) {
      processedProps.modelValue = mergedProps.modelValue.value;
      processedProps['onUpdate:modelValue'] = (newVal: unknown) => {
        emit('update:modelValue', newVal);
      };
    }

    // v-model:foo
    for (const [key, value] of Object.entries(mergedProps.props?.value ?? {})) {
      if (key.startsWith('v-model:')) {
        const modelName = key.replace('v-model:', '');
        if (isRef(value)) {
          processedProps[modelName] = value.value;
          processedProps[`onUpdate:${modelName}`] = (newVal: unknown) => {
            value.value = newVal;
          };
        } else {
          processedProps[modelName] = value;
        }
      }
    }

    return processedProps;
  });

  // Listeners + emits
  const dynamicListeners = computed<Record<string, (...args: unknown[]) => void>>(() => {
    const result: Record<string, (...args: unknown[]) => void> = {};
    const userListeners = mergedProps.listeners?.value || {};

    // emits
    customEmits.value.forEach((eventName) => {
      const capitalized = eventName.charAt(0).toUpperCase() + eventName.slice(1);
      result[`on${capitalized}`] = (...args: unknown[]) => {
        logAction(eventName, args); // LOGGING HERE
        if (customEmits.value.includes(eventName)) {
          emit(eventName, ...args);
        }
      };
    });

    // User listeners
    for (const [key, handler] of Object.entries(userListeners)) {
      if (!key.startsWith('on')) {
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        result[`on${capitalized}`] = handler;
      } else {
        result[key] = handler;
      }
    }

    return result;
  });

  // Build final VNode
  const renderedComponent = computed<VNode>(() => {
    const allProps = {
      ...dynamicProps.value,
      ...dynamicListeners.value,
    };
    if (typeof mergedProps.component.value === 'string') {
      return h(mergedProps.component.value, allProps, slots);
    }
    return h(mergedProps.component.value as Component, allProps, slots);
  });

  // Serialize slots
  const slotContents = computed<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    for (const slotName of Object.keys(slots)) {
      const vnodes = slots[slotName]?.() || [];
      result[slotName] = serializeSlotVNodes(vnodes);
    }
    return result;
  });

  // Code generation
  const generatedCode = computed(() => {
    if (isFrozen.value) {
      return frozenCode.value;
    }

    const compName =
      props.name ||
      (typeof props.component === 'string'
        ? props.component
        : (props.component as DefineComponent)?.name ||
          (props.component as DefineComponent)?.__name) ||
      'UnknownComponent';

    const onUpdates: Record<string, boolean> = {};
    Object.keys(dynamicProps.value).forEach((k) => {
      if (k.startsWith('onUpdate:')) {
        onUpdates[k.slice('onUpdate:'.length)] = true;
      }
    });

    const vModelVars: Array<{
      key: string;
      varName: string;
      initialValue: unknown;
    }> = [];

    const usedVarNames = new Set<string>();
    function getUniqueVarName(base: string): string {
      let candidate = base;
      let i = 2;
      while (usedVarNames.has(candidate)) {
        candidate = base + i;
        i++;
      }
      usedVarNames.add(candidate);
      return candidate;
    }

    function propToTemplateAttr(key: string, val: unknown): string | null {
      if (specialDirectives[key]) {
        return `${specialDirectives[key]}="${String(val)}"`;
      }

      if (key === 'modelValue' && onUpdates['modelValue']) {
        if (fullVueFile) {
          const varName = getUniqueVarName('componentValue');
          vModelVars.push({
            key,
            varName,
            initialValue: val,
          });
          return `v-model="${varName}"`;
        } else {
          return `v-model="${String(val)}"`;
        }
      }

      if (onUpdates[key]) {
        if (fullVueFile) {
          const varName = getUniqueVarName(key);
          vModelVars.push({
            key,
            varName,
            initialValue: val,
          });
          return `v-model:${key}="${varName}"`;
        } else {
          return `v-model:${key}="${String(val)}"`;
        }
      }

      if (key.startsWith('onUpdate:')) {
        return null;
      }

      const attrName = kebabCase ? toKebabCase(key) : key;

      if (typeof val === 'function') {
        const fnText = val.toString().replace(/^/gm, '  ');
        return `:${attrName}="\n${fnText}\n"`;
      } else if (typeof val === 'object' && val !== null) {
        const json = prettyStringify(val, 2).replace(/^/gm, '    ');
        return `:${attrName}="\n${json}\n  "`;
      } else if (typeof val === 'boolean' || typeof val === 'number') {
        return `:${attrName}="${val}"`;
      } else if (typeof val === 'string') {
        return `${attrName}="${val}"`;
      }
      return `:${attrName}="${String(val)}"`;
    }

    const propLines: string[] = [];
    Object.entries(dynamicProps.value).forEach(([key, val]) => {
      const line = propToTemplateAttr(key, val);
      if (line) {
        if (withComments) {
          propLines.push(`  <!-- prop: ${key} -->`);
        }
        propLines.push(`  ${line}`);
      }
    });

    const eventLines: string[] = [];
    for (const eventName of props.emits || []) {
      if (eventName.startsWith('update:')) {
        continue;
      }
      const handlerName = eventNameToHandler[eventName] || 'handler';
      if (withComments) {
        eventLines.push(`  <!-- event: ${eventName} -->`);
      }
      const eventAttr = kebabCase ? toKebabCase(eventName) : eventName;
      eventLines.push(`  @${eventAttr}="${handlerName}"`);
    }

    const slotLines: string[] = [];
    for (const [slotName, content] of Object.entries(slotContents.value)) {
      const propsArr = slotProps[slotName] || [];
      const slotPropsString = propsArr.length ? `{ ${propsArr.join(', ')} }` : '';

      if (content.trim()) {
        slotLines.push(
          `<template #${slotName}${slotPropsString ? `="${slotPropsString}"` : ''}>`
        );
        const indented = content
          .split('\n')
          .map((line) => '    ' + line)
          .join('\n');
        slotLines.push(indented);
        slotLines.push(`</template>`);
      } else {
        slotLines.push(
          `<template #${slotName}${slotPropsString ? `="${slotPropsString}"` : ''}></template>`
        );
      }
    }

    const allAttrs = [...propLines, ...eventLines];
    const lines: string[] = [];

    lines.push(`<${compName}`);
    allAttrs.forEach((attr) => {
      lines.push(attr);
    });

    if (!slotLines.length) {
      lines.push(`/>`);
    } else {
      lines.push(`>`);
      slotLines.forEach((line) => {
        lines.push(line);
      });
      lines.push(`</${compName}>`);
    }

    const finalTag = lines.join('\n');

    if (fullVueFile) {
      let scriptLines: string[] = [];
      if (vModelVars.length) {
        scriptLines = vModelVars.map(({ varName, initialValue }) => {
          const valueSerialized =
            typeof initialValue === 'string'
              ? JSON.stringify(initialValue)
              : prettyStringify(initialValue, 0);
          return `const ${varName} = ref(${valueSerialized})`;
        });
      }

      let hasAnyEvent = false;
      for (const eventName of props.emits || []) {
        if (!eventName.startsWith('update:')) {
          hasAnyEvent = true;
          break;
        }
      }

      const handlerBlock = hasAnyEvent
        ? `
function handler(...args) {
  console.log('Event from ${compName}', ...args)
}
`.trim()
        : '';

      const finalScript = `
<script setup>
import { ref } from 'vue'

// Auto-generated model refs:
${scriptLines.join('\n')}

${handlerBlock}
</script>`.trim();

      return `
<template>
${finalTag}
</template>

${finalScript}
      `.trim();
    } else {
      return finalTag;
    }
  });

  // Freeze/unfreeze
  const toggleFreeze = () => {
    if (!isFrozen.value) {
      frozenCode.value = generatedCode.value;
    }
    isFrozen.value = !isFrozen.value;
  };

  onUnmounted(() => {
    stopWatcher();
  });

  return {
    isFrozen,
    toggleFreeze,
    renderedComponent,
    generatedCode,
    dynamicProps,
    actionLogs,
    clearLogs,
    dynamicListeners,
  };
}

