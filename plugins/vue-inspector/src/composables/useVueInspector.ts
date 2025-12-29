import { ref, computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import type { ComponentTreeNode, ComponentState } from '../types';

/**
 * Composable for Vue Inspector functionality
 */
export function useVueInspector(api: ClientApi) {
  const isEnabled = ref(false);
  const isReady = ref(false);
  const componentTree = ref<ComponentTreeNode[]>([]);
  const selectedComponentId = ref<string>('');
  const componentState = ref<ComponentState | null>(null);
  const filterText = ref('');

  // Get component tree
  const getComponentTree = async (filter?: string) => {
    try {
      const tree = await api.rpc.call<ComponentTreeNode[]>('vue-inspector:getComponentTree', {
        filter: filter || filterText.value,
      });
      componentTree.value = tree;
      return tree;
    } catch (error) {
      api.notify(`Failed to load component tree: ${error}`, 'error');
      return [];
    }
  };

  // Get component state
  const getComponentState = async (id: string) => {
    try {
      const state = await api.rpc.call<ComponentState>('vue-inspector:getComponentState', { id });
      componentState.value = state;
      selectedComponentId.value = id;
      return state;
    } catch (error) {
      api.notify(`Failed to load component state: ${error}`, 'error');
      return null;
    }
  };

  // Enable inspector - send command via AppBridge directly to app.ts
  const enableInspector = () => {
    try {
      // Send via AppBridge (app.ts listens to this)
      // We create a temporary bridge instance for sending the command
      const bridge = new AppBridge('vue-inspector');
      bridge.send('inspector:enable');
      bridge.close();
      // State will be updated via bridge.on('inspector:enabled') in VueInspectorPanel
    } catch (error) {
      api.notify(`Failed to enable inspector: ${error}`, 'error');
    }
  };

  // Disable inspector
  const disableInspector = () => {
    try {
      const bridge = new AppBridge('vue-inspector');
      bridge.send('inspector:disable');
      bridge.close();
      // State will be updated via bridge.on('inspector:enabled') in VueInspectorPanel
    } catch (error) {
      api.notify(`Failed to disable inspector: ${error}`, 'error');
    }
  };

  // Toggle inspector
  const toggleInspector = () => {
    if (isEnabled.value) {
      disableInspector();
    } else {
      enableInspector();
    }
  };

  // Highlight component on page
  const highlightComponent = async (id: string) => {
    try {
      await api.rpc.call('vue-inspector:highlightComponent', { id });
    } catch (error) {
      api.notify(`Failed to highlight component: ${error}`, 'error');
    }
  };

  // Unhighlight component
  const unhighlightComponent = async () => {
    try {
      await api.rpc.call('vue-inspector:unhighlightComponent');
    } catch (error) {
      api.notify(`Failed to unhighlight component: ${error}`, 'error');
    }
  };

  // Scroll to component
  const scrollToComponent = async (id: string) => {
    try {
      await api.rpc.call('vue-inspector:scrollToComponent', { id });
    } catch (error) {
      api.notify(`Failed to scroll to component: ${error}`, 'error');
    }
  };

  // Filtered tree
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

  return {
    isEnabled,
    isReady,
    componentTree: filteredTree,
    selectedComponentId,
    componentState,
    filterText,
    getComponentTree,
    getComponentState,
    enableInspector,
    disableInspector,
    toggleInspector,
    highlightComponent,
    unhighlightComponent,
    scrollToComponent,
  };
}

