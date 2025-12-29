import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { AppBridge } from '@u-devtools/core';
import type { ComponentTreeNode, ComponentState } from '../types';

/**
 * Composable for component tree functionality
 */
export function useComponentTree() {
  const componentTree = ref<ComponentTreeNode[]>([]);
  const selectedComponentId = ref<string>('');
  const componentState = ref<ComponentState | null>(null);
  const filterText = ref('');
  const expandedNodes = ref<Set<string>>(new Set());
  const isLoading = ref(false);

  const bridge = new AppBridge('vue-inspector');

  // Filtered tree (client-side filtering for speed)
  const filteredTree = computed(() => {
    if (!filterText.value) return componentTree.value;

    const filter = filterText.value.toLowerCase();
    const filterNode = (node: ComponentTreeNode): ComponentTreeNode | null => {
      const matches = node.name.toLowerCase().includes(filter);
      const filteredChildren = node.children
        ?.map(filterNode)
        .filter((n): n is ComponentTreeNode => n !== null) || [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }
      return null;
    };

    return componentTree.value
      .map(filterNode)
      .filter((n): n is ComponentTreeNode => n !== null);
  });

  // Flatten tree for easier navigation
  const flattenedTree = computed(() => {
    const result: ComponentTreeNode[] = [];
    const flatten = (nodes: ComponentTreeNode[]) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children) {
          flatten(node.children);
        }
      });
    };
    flatten(filteredTree.value);
    return result;
  });

  // --- Actions ---

  const getComponentTree = () => {
    try {
      isLoading.value = true;
      bridge.send('inspector:getComponentTree', { filter: filterText.value });
    } catch (e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const getComponentState = (id: string) => {
    try {
      isLoading.value = true;
      selectedComponentId.value = id;
      bridge.send('inspector:getComponentState', { id });
    } catch (e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const selectComponent = (node: ComponentTreeNode) => {
    getComponentState(node.id);
  };

  const scrollToComponent = (id: string) => {
    try {
      bridge.send('inspector:scrollToComponent', { id });
    } catch (e) {
      // Ignore if bridge is closed
    }
  };


  const getComponentRenderCode = (nodeId: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        bridge.send('inspector:getComponentRenderCode', { nodeId });
        
        const handler = (result: { code: string }) => {
          unsubscribe();
          resolve(result.code || '');
        };
        const unsubscribe = bridge.on('inspector:componentRenderCode', handler);
        
        const timeoutId = setTimeout(() => {
          unsubscribe();
          resolve('');
        }, 5000);
        
        const originalResolve = resolve;
        resolve = (value) => {
          clearTimeout(timeoutId);
          originalResolve(value);
        };
      } catch (e) {
        console.error('[Vue Inspector] Failed to send getComponentRenderCode', e);
        resolve('');
      }
    });
  };

  const inspectComponentInspector = (): Promise<{ id: string } | null> => {
    return new Promise((resolve) => {
      try {
        bridge.send('inspector:inspectComponentInspector');
        
        const handler = (result: { data: { id: string } | null }) => {
          unsubscribe();
          resolve(result.data);
        };
        const unsubscribe = bridge.on('inspector:inspectComponentInspector:result', handler);
        
        const timeoutId = setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 10000);
        
        const originalResolve = resolve;
        resolve = (value) => {
          clearTimeout(timeoutId);
          originalResolve(value);
        };
      } catch (e) {
        console.error('[Vue Inspector] Failed to send inspectComponentInspector', e);
        resolve(null);
      }
    });
  };

  const cancelInspectComponentInspector = () => {
    try {
      bridge.send('inspector:cancelInspectComponentInspector');
    } catch (e) {
      console.error('[Vue Inspector] Failed to send cancelInspectComponentInspector', e);
    }
  };

  const highlightComponent = (id: string) => {
    try {
      bridge.send('inspector:highlight', { id });
    } catch (e) {
      // Ignore if bridge is closed
    }
  };

  const unhighlightComponent = () => {
    try {
      bridge.send('inspector:unhighlight');
    } catch (e) {
      // Ignore if bridge is closed
    }
  };

  const toggleExpanded = (nodeId: string) => {
    if (expandedNodes.value.has(nodeId)) {
      expandedNodes.value.delete(nodeId);
    } else {
      expandedNodes.value.add(nodeId);
    }
  };

  const isExpanded = (nodeId: string) => {
    return expandedNodes.value.has(nodeId);
  };

  // --- Listeners ---

  bridge.on('inspector:componentTree', (tree: ComponentTreeNode[]) => {
    componentTree.value = tree || [];
    isLoading.value = false;
    
    // Auto-expand first level
    if (tree && tree.length > 0 && expandedNodes.value.size === 0) {
      tree.forEach((node) => {
        if (node.children && node.children.length > 0) {
          expandedNodes.value.add(node.id);
        }
      });
    }
  });

  bridge.on('inspector:componentState', (state: ComponentState) => {
    const hasProps = !!(state?.props?.length);
    const hasData = !!(state?.data?.length);
    const hasComputed = !!(state?.computed?.length);
    const hasSetupState = !!state?.setupState;
    const hasMethods = !!(state?.methods?.length);
    console.log(`[Vue Inspector] componentState received: hasState=${!!state}, props=${hasProps}, data=${hasData}, computed=${hasComputed}, setupState=${hasSetupState}, methods=${hasMethods}`);
    componentState.value = state;
    isLoading.value = false;
  });

  // --- Watchers ---

  watch(filterText, () => {
    getComponentTree();
  });

  // --- Lifecycle ---

  onMounted(() => {
    getComponentTree();
    // Polling for tree updates (temporary solution until reactive events are set up)
    const interval = setInterval(getComponentTree, 2000);
    onUnmounted(() => clearInterval(interval));
  });

  onUnmounted(() => {
    // Don't close bridge here - it's shared and may be used by other components
    // Just unhighlight
    try {
      unhighlightComponent();
    } catch (e) {
      // Ignore if bridge is already closed
    }
  });

  return {
    componentTree: filteredTree,
    flattenedTree,
    selectedComponentId,
    componentState,
    filterText,
    expandedNodes,
    isLoading,
    getComponentTree,
    getComponentState,
    selectComponent,
    toggleExpanded,
    isExpanded,
    highlightComponent,
    unhighlightComponent,
    scrollToComponent,
    getComponentRenderCode,
    inspectComponentInspector,
    cancelInspectComponentInspector,
  };
}
