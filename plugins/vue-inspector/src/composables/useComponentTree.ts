import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useBridge } from '../context';
import type { ComponentTreeNode, ComponentState } from '../types';

/**
 * Composable for component tree functionality
 */
export function useComponentTree(selectedAppId?: () => string) {
  const bridge = useBridge();
  
  const componentTree = ref<ComponentTreeNode[]>([]);
  const selectedComponentId = ref<string>('');
  const componentState = ref<ComponentState | null>(null);
  const filterText = ref('');
  const expandedNodes = ref<Set<string>>(new Set());
  const isLoading = ref(false);

  // Filtered tree (client-side filtering for speed)
  const filteredTree = computed(() => {
    if (!filterText.value) return componentTree.value;

    const filter = filterText.value.toLowerCase();
    const filterNode = (node: ComponentTreeNode): ComponentTreeNode | null => {
      const matches = node.name.toLowerCase().includes(filter);
      const filteredChildren =
        node.children?.map(filterNode).filter((n): n is ComponentTreeNode => n !== null) || [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }
      return null;
    };

    return componentTree.value.map(filterNode).filter((n): n is ComponentTreeNode => n !== null);
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
      const appId = selectedAppId?.();
      bridge.send('inspector:getComponentTree', { 
        filter: filterText.value,
        appId: appId || undefined
      });
    } catch (e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const getComponentState = (id: string) => {
    try {
      isLoading.value = true;
      selectedComponentId.value = id;
      const appId = selectedAppId?.();
      bridge.send('inspector:getComponentState', { 
        id,
        appId: appId || undefined
      });
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
    } catch (_e) {
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

        const handler = (result: { data: unknown }) => {
          unsubscribe();
          const data = result.data as { id: string } | null;
          resolve(data);
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

  const isExpanded = (nodeId: string) => {
    return expandedNodes.value.has(nodeId);
  };

  // --- Listeners ---

  // Обработка выбора компонента через "Pick Element"
  bridge.on('inspector:component-selected', async ({ id, uid, appId }) => {
    // Если передан appId и он отличается от текущего, переключаемся на это приложение
    if (appId && selectedAppId && appId !== selectedAppId()) {
      // Переключаемся на нужное приложение
      // Это будет обработано автоматически через getComponentTree/getComponentState
    }
    
    // Сначала загружаем дерево компонентов, если оно еще не загружено
    if (componentTree.value.length === 0) {
      await getComponentTree();
      // Ждем немного, чтобы дерево обновилось через событие
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Если передан uid, ищем компонент в дереве по uid и используем правильный ID
    let componentId = id;
    
    if (uid !== undefined && componentTree.value.length > 0) {
      const findComponentByUid = (nodes: ComponentTreeNode[], searchUid: number): ComponentTreeNode | null => {
        for (const node of nodes) {
          const nodeUid = node.uid;
          
          // 1. Прямое сравнение uid (проверяем, что uid не undefined)
          if (nodeUid !== undefined && (nodeUid === searchUid || nodeUid === String(searchUid) || Number(nodeUid) === searchUid)) {
            return node;
          }
          
          // 2. Извлекаем номер из ID формата "app-1:6" или "6"
          if (node.id) {
            const idMatch = node.id.match(/:(\d+)$/) || node.id.match(/^(\d+)$/);
            if (idMatch) {
              const idNumber = Number(idMatch[1]);
              if (idNumber === searchUid) {
                return node;
              }
            }
            
            // 3. Прямое сравнение ID как строки или числа
            if (node.id === String(searchUid) || Number(node.id) === searchUid) {
              return node;
            }
          }
          
          // Рекурсивно ищем в дочерних элементах
          if (node.children && Array.isArray(node.children)) {
            const found = findComponentByUid(node.children, searchUid);
            if (found) return found;
          }
        }
        return null;
      };
      
      const foundNode = findComponentByUid(componentTree.value, uid);
      if (foundNode?.id) {
        componentId = foundNode.id;
      }
    }
    
    // 1. Устанавливаем ID
    selectedComponentId.value = componentId;
    
    // 2. Раскрываем дерево до этого элемента
    const expandParents = (nodes: ComponentTreeNode[], targetId: string): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) return true;
        if (node.children) {
          if (expandParents(node.children, targetId)) {
            expandedNodes.value.add(node.id);
            return true;
          }
        }
      }
      return false;
    };
    expandParents(componentTree.value, componentId);

    // 3. Загружаем стейт (appId уже учтен в getComponentState через selectedAppId)
    getComponentState(componentId);
  });

  bridge.on('inspector:componentTree', (tree: ComponentTreeNode[]) => {
    // Сохраняем состояние перед обновлением дерева
    const previousSelectedId = selectedComponentId.value;
    const previousExpandedIds = Array.from(expandedNodes.value);
    
    // Создаем карту старых узлов: uid -> { id, path }
    const oldNodesMap = new Map<number | string, { id: string; path: string[] }>();
    const buildOldMap = (nodes: ComponentTreeNode[], path: string[] = []) => {
      for (const node of nodes) {
        if (node.uid !== undefined) {
          oldNodesMap.set(node.uid, { id: node.id, path: [...path, node.name] });
        }
        if (node.children && Array.isArray(node.children)) {
          buildOldMap(node.children, [...path, node.name]);
        }
      }
    };
    buildOldMap(componentTree.value);
    
    componentTree.value = tree || [];
    isLoading.value = false;

    // Восстанавливаем развернутые узлы, используя uid для сопоставления
    const newExpandedIds = new Set<string>();
    
    // Функция для поиска узла по uid в новом дереве
    const findNodeByUid = (nodes: ComponentTreeNode[], targetUid: number | string): ComponentTreeNode | null => {
      for (const node of nodes) {
        if (node.uid !== undefined && 
            (node.uid === targetUid || node.uid === String(targetUid) || Number(node.uid) === targetUid)) {
          return node;
        }
        if (node.children && Array.isArray(node.children)) {
          const found = findNodeByUid(node.children, targetUid);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Функция для поиска узла по пути (name + позиция)
    const findNodeByPath = (nodes: ComponentTreeNode[], path: string[]): ComponentTreeNode | null => {
      if (path.length === 0) return null;
      const [targetName, ...rest] = path;
      for (const node of nodes) {
        if (node.name === targetName) {
          if (rest.length === 0) return node;
          if (node.children && Array.isArray(node.children)) {
            const found = findNodeByPath(node.children, rest);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    // Восстанавливаем развернутые узлы
    for (const oldId of previousExpandedIds) {
      // Сначала пытаемся найти по ID (на случай, если ID не изменился)
      const findById = (nodes: ComponentTreeNode[], targetId: string): ComponentTreeNode | null => {
        for (const node of nodes) {
          if (node.id === targetId) return node;
          if (node.children && Array.isArray(node.children)) {
            const found = findById(node.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      
      let newNode = findById(componentTree.value, oldId);
      
      // Если не нашли по ID, ищем по uid из старой карты
      if (!newNode) {
        for (const [uid, oldNodeData] of oldNodesMap.entries()) {
          if (oldNodeData.id === oldId) {
            newNode = findNodeByUid(componentTree.value, uid);
            if (newNode) break;
            
            // Если не нашли по uid, пытаемся найти по пути
            if (!newNode) {
              newNode = findNodeByPath(componentTree.value, oldNodeData.path);
            }
            if (newNode) break;
          }
        }
      }
      
      if (newNode) {
        newExpandedIds.add(newNode.id);
      }
    }
    
    expandedNodes.value = newExpandedIds;

    // Восстанавливаем выбранный компонент
    if (previousSelectedId) {
      const findNodeById = (nodes: ComponentTreeNode[], targetId: string): ComponentTreeNode | null => {
        for (const node of nodes) {
          if (node.id === targetId) return node;
          if (node.children && Array.isArray(node.children)) {
            const found = findNodeById(node.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      
      let stillExists = findNodeById(componentTree.value, previousSelectedId);
      
      // Если не нашли по ID, ищем по uid
      if (!stillExists) {
        for (const [uid, oldNodeData] of oldNodesMap.entries()) {
          if (oldNodeData.id === previousSelectedId) {
            stillExists = findNodeByUid(componentTree.value, uid);
            if (stillExists) break;
            
            // Если не нашли по uid, пытаемся найти по пути
            if (!stillExists) {
              stillExists = findNodeByPath(componentTree.value, oldNodeData.path);
            }
            if (stillExists) break;
          }
        }
      }
      
      if (stillExists) {
        selectedComponentId.value = stillExists.id;
        // Раскрываем дерево до выбранного компонента
        const expandParents = (nodes: ComponentTreeNode[], targetId: string): boolean => {
          for (const node of nodes) {
            if (node.id === targetId) return true;
            if (node.children) {
              if (expandParents(node.children, targetId)) {
                expandedNodes.value.add(node.id);
                return true;
              }
            }
          }
          return false;
        };
        expandParents(componentTree.value, stillExists.id);
      }
    }

    // Auto-expand first level (только если нет выбранного компонента и нет развернутых узлов)
    if (tree && tree.length > 0 && expandedNodes.value.size === 0 && !selectedComponentId.value) {
      tree.forEach((node) => {
        if (node.children && node.children.length > 0) {
          expandedNodes.value.add(node.id);
        }
      });
    }
  });

  bridge.on('inspector:componentState', (state: ComponentState | null) => {
    if (!state) {
      componentState.value = null;
      isLoading.value = false;
      return;
    }
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
    // Увеличено до 5 секунд, чтобы не мешать работе
    const interval = setInterval(getComponentTree, 5000);
    onUnmounted(() => clearInterval(interval));
  });

  onUnmounted(() => {
    // Don't close bridge here - it's shared and may be used by other components
    // Just unhighlight
    try {
      unhighlightComponent();
    } catch (_e) {
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
