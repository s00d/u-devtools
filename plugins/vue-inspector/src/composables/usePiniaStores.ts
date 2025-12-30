import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { AppBridge } from '@u-devtools/core';
import type { CustomInspectorNode, CustomInspectorState } from '../types';

/**
 * Composable for Pinia stores functionality
 */
export function usePiniaStores() {
  const storesTree = ref<CustomInspectorNode[]>([]);
  const selectedStoreId = ref<string>('');
  const storeState = ref<Record<string, CustomInspectorState[]>>({});
  const filterStoreKey = ref('');
  const filterStateKey = ref('');
  const expandedNodes = ref<Set<string>>(new Set());
  const expandedStateNodes = ref<Set<string>>(new Set());
  const isLoading = ref(false);

  const bridge = new AppBridge('vue-inspector');

  // Filtered stores tree
  const filteredStoresTree = computed(() => {
    if (!filterStoreKey.value) return storesTree.value;

    const filter = filterStoreKey.value.toLowerCase();
    const filterNode = (node: CustomInspectorNode): CustomInspectorNode | null => {
      const matches = node.label.toLowerCase().includes(filter) ||
                     (node.name?.toLowerCase().includes(filter));
      const filteredChildren = node.children
        ?.map(filterNode)
        .filter((n): n is CustomInspectorNode => n !== null) || [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }
      return null;
    };

    return storesTree.value
      .map(filterNode)
      .filter((n): n is CustomInspectorNode => n !== null);
  });

  // Filtered state
  const filteredState = computed(() => {
    if (!filterStateKey.value) return storeState.value;

    const filter = filterStateKey.value.toLowerCase();
    const result: Record<string, CustomInspectorState[]> = {};

    Object.entries(storeState.value).forEach(([key, states]) => {
      const filtered = states.filter((state) => {
        if (typeof state === 'object' && state !== null && 'key' in state) {
          return String(state.key).toLowerCase().includes(filter);
        }
        return false;
      });
      if (filtered.length > 0) {
        result[key] = filtered;
      }
    });

    return result;
  });

  // Flatten tree
  const flattenedTree = computed(() => {
    const result: CustomInspectorNode[] = [];
    const flatten = (nodes: CustomInspectorNode[]) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children) {
          flatten(node.children);
        }
      });
    };
    flatten(filteredStoresTree.value);
    return result;
  });

  // --- Actions ---

  const getStoresTree = () => {
    try {
      isLoading.value = true;
      bridge.send('inspector:getPiniaTree', { filter: filterStoreKey.value });
    } catch (_e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const getStoreState = (nodeId: string) => {
    try {
      isLoading.value = true;
      bridge.send('inspector:getPiniaState', { nodeId });
    } catch (_e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const selectStore = (node: CustomInspectorNode) => {
    selectedStoreId.value = node.id;
    getStoreState(node.id);

    // Expand parent nodes
    const expandParents = (nodes: CustomInspectorNode[], targetId: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.id];
        if (node.id === targetId) {
          return currentPath;
        }
        if (node.children) {
          const found = expandParents(node.children, targetId, currentPath);
          if (found) {
            found.forEach((id) => {
              expandedNodes.value.add(id);
            });
            return found;
          }
        }
      }
      return null;
    };
    expandParents(storesTree.value, node.id);
  };

  const editState = async (payload: { nodeId: string; path: string[]; type: 'state' | 'getters'; value: unknown }) => {
    try {
      bridge.send('inspector:editPiniaState', payload);
    } catch (_e) {
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

  const toggleStateExpanded = (sectionId: string) => {
    if (expandedStateNodes.value.has(sectionId)) {
      expandedStateNodes.value.delete(sectionId);
    } else {
      expandedStateNodes.value.add(sectionId);
    }
  };

  const isExpanded = (nodeId: string) => {
    return expandedNodes.value.has(nodeId);
  };

  const isStateExpanded = (sectionId: string) => {
    return expandedStateNodes.value.has(sectionId);
  };

  // --- Listeners ---

  bridge.on('inspector:piniaTree', (tree: CustomInspectorNode[]) => {
    storesTree.value = tree || [];
    isLoading.value = false;

    // Auto-select first store
    if (tree && tree.length > 0 && !selectedStoreId.value) {
      selectedStoreId.value = tree[0].id;
      // Auto-expand first level
      tree.forEach((node) => {
        if (node.children && node.children.length > 0) {
          expandedNodes.value.add(node.id);
        }
      });
      // Load state asynchronously
      getStoreState(tree[0].id);
    }
  });

  bridge.on('inspector:piniaState', (state: Record<string, CustomInspectorState[]>) => {
    storeState.value = state || {};
    isLoading.value = false;
    // Auto-expand state sections
    Object.keys(storeState.value).forEach((_key, index) => {
      expandedStateNodes.value.add(String(index));
    });
  });

  // --- Watchers ---

  watch(filterStoreKey, () => {
    getStoresTree();
  });

  watch(selectedStoreId, () => {
    if (selectedStoreId.value) {
      getStoreState(selectedStoreId.value);
    }
  });

  // --- Lifecycle ---

  onMounted(() => {
    getStoresTree();
    // Polling for updates (Pinia is reactive, but Inspector API requires polling)
    const timer = setInterval(getStoresTree, 2000);
    const timerState = setInterval(() => {
      if (selectedStoreId.value) {
        getStoreState(selectedStoreId.value);
      }
    }, 1000);

    onUnmounted(() => {
      clearInterval(timer);
      clearInterval(timerState);
    });
  });

  onUnmounted(() => {
    // Don't close bridge - it's shared
  });

  return {
    storesTree: filteredStoresTree,
    flattenedTree,
    selectedStoreId,
    storeState: filteredState,
    filterStoreKey,
    filterStateKey,
    expandedNodes,
    expandedStateNodes,
    isLoading,
    getStoresTree,
    getStoreState,
    selectStore,
    toggleExpanded,
    toggleStateExpanded,
    isExpanded,
    isStateExpanded,
    editState,
  };
}
