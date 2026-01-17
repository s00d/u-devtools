import { ref, computed, watch, nextTick } from 'vue';
import { useApi } from '../context';
import type {
  FileNode,
  AppConfig,
  AppStats,
  GenerateResult,
  ProgressEvent,
} from '../types';
import {
  fileNodeToConfigNode,
  configNodeToFileNode,
  type R2XConfig,
  type ConfigNode,
} from '../utils/r2x-config';

/**
 * Debounce function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export interface FileRow extends FileNode {
  depth: number;
}

// Global state shared across all composable instances
let listenersSetup = false;
let analysisCompletedUnsubscribe: (() => void) | null = null;

// Global state refs (shared across all instances)
const nodes = ref<FileNode[]>([]);
const rootPath = ref<string>('');
const stats = ref<AppStats>({ files: 0, size: 0, tokens: 0 });
const isLoading = ref(false);
const isAnalyzing = ref(false);
const selectedFilePath = ref<string | null>(null);
const loadingNodes = ref<Set<string>>(new Set());
const searchQuery = ref('');
const searchResults = ref<string[]>([]);
const focusedNodeId = ref<string | null>(null);

/**
 * Composable for managing repository state and operations
 */
export function useRepo() {
  const api = useApi();
  
  // Configuration from settings API (automatically persisted)
  const config = computed<AppConfig>(() => {
    // Get default config for fallback values
    const defaultConfig: AppConfig = {
      ignored_names: [],
      ignored_folders: [],
      binary_extensions: [],
      token_limit: 128000,
      max_file_size: 1024 * 1024,
      output_template: '## {{path}}\n\n```{{language}}\n{{content}}\n```\n\n---\n\n',
    };

    return {
      token_limit: api.settings.get<number>('token_limit', defaultConfig.token_limit),
      max_file_size: api.settings.get<number>('max_file_size', defaultConfig.max_file_size),
      output_template: api.settings.get<string>('output_template', defaultConfig.output_template),
      ignored_names: api.settings.get<string[]>('ignored_names', defaultConfig.ignored_names),
      ignored_folders: api.settings.get<string[]>('ignored_folders', defaultConfig.ignored_folders),
      binary_extensions: api.settings.get<string[]>('binary_extensions', defaultConfig.binary_extensions),
    };
  });

  // Load last opened path (still use storage for this, as it's not a setting)
  function loadLastPath(): string | null {
    return api.storage.get<string | null>('last-path', null);
  }
  
  // Save last opened path (still use storage for this)
  function saveLastPath() {
    if (rootPath.value) {
      api.storage.set('last-path', rootPath.value);
    }
  }

  // Load config from storage
  async function loadConfigFromStorage() {
    try {
      const stored = api.storage.get<R2XConfig | null>('r2x-config', null);
      if (!stored || !stored.nodes) return;

      // Check if config belongs to current directory
      if (stored.rootPath && stored.rootPath !== rootPath.value) {
        console.log('[repo2txt] Config path mismatch, clearing config:', {
          stored: stored.rootPath,
          current: rootPath.value,
        });
        // Clear config if path doesn't match
        api.storage.remove('r2x-config');
        return;
      }

      // Convert config nodes back to file nodes and apply state
      const nodeMap = new Map<string, FileNode>();
      for (const node of nodes.value) {
        nodeMap.set(node.id, node);
      }

      const applyConfigNode = async (configNode: ConfigNode, parentId: string | null = null) => {
        // Find matching file node by path
        const fileNode = nodes.value.find((n) => n.relative_path === configNode.path);
        if (fileNode) {
          const wasSelected = fileNode.selected;
          const wasExpanded = fileNode.expanded;
          
          fileNode.selected = configNode.selected;
          fileNode.expanded = configNode.expanded;
          
          // Sync with server if state changed
          if (wasSelected !== configNode.selected) {
            try {
              await api.rpc.call('repo2txt:update-selection', {
                id: fileNode.id,
                selected: configNode.selected,
              });
            } catch (error) {
              console.warn('[repo2txt] Failed to sync selection with server:', error);
            }
          }
          
          if (wasExpanded !== configNode.expanded && fileNode.is_directory) {
            try {
              await api.rpc.call('repo2txt:toggle-expanded', {
                id: fileNode.id,
                expanded: configNode.expanded,
              });
            } catch (error) {
              console.warn('[repo2txt] Failed to sync expansion with server:', error);
            }
          }
        }

        // Recursively apply to children
        if (configNode.children) {
          for (const child of configNode.children) {
            await applyConfigNode(child, fileNode?.id || null);
          }
        }
      };

      for (const configNode of stored.nodes) {
        await applyConfigNode(configNode);
      }

      recalculateStats();
    } catch (error) {
      console.error('[repo2txt] Failed to load config from storage:', error);
    }
  }

  // Save config to storage
  function saveConfigToStorage() {
    try {
      const rootNodes = nodes.value.filter((n) => !n.parent_id);
      const nodeMap = new Map<string, FileNode>();
      for (const node of nodes.value) {
        nodeMap.set(node.id, node);
      }

      const configNodes = rootNodes.map((n) => fileNodeToConfigNode(n, nodeMap));
      const r2xConfig: R2XConfig = {
        version: '1.0',
        rootPath: rootPath.value, // Store current path with config
        nodes: configNodes,
      };

      api.storage.set('r2x-config', r2xConfig);
    } catch (error) {
      console.error('[repo2txt] Failed to save config to storage:', error);
    }
  }

  // Clear config from storage
  function clearConfig() {
    try {
      api.storage.remove('r2x-config');
      // Reset all selections and expansions
      for (const node of nodes.value) {
        node.selected = false;
        node.expanded = false;
      }
      recalculateStats();
      api.notify('Configuration cleared', 'success');
    } catch (error) {
      console.error('[repo2txt] Failed to clear config:', error);
      api.notify('Failed to clear configuration', 'error');
    }
  }

  // Computed: visible rows for tree display
  const visibleRows = computed<FileRow[]>(() => {
    const rows: FileRow[] = [];

    // If searching, show only search results
    if (searchQuery.value.trim()) {
      const resultsSet = new Set(searchResults.value);
      return nodes.value
        .filter((n) => resultsSet.has(n.id))
        .map((n) => ({
          ...n,
          depth: 0,
        }));
    }

    // Build children map
    const childrenMap = new Map<string | null, FileNode[]>();
    for (const node of nodes.value) {
      const pid = node.parent_id || null;
      if (!childrenMap.has(pid)) {
        childrenMap.set(pid, []);
      }
      childrenMap.get(pid)!.push(node);
    }

    // Sort function: directories first, then alphabetically
    const sortNodes = (a: FileNode, b: FileNode) => {
      if (a.is_directory !== b.is_directory) {
        return a.is_directory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    };

    // Recursive traversal
    const traverse = (parentId: string | null, depth: number) => {
      const children = (childrenMap.get(parentId) || []).sort(sortNodes);

      for (const node of children) {
        rows.push({
          ...node,
          depth,
        });

        if (node.is_directory && node.expanded) {
          traverse(node.id, depth + 1);
        }
      }
    };

    traverse(null, 0);
    return rows;
  });

  // Open directory
  async function openDirectory(customPath?: string) {
    const path = customPath || loadLastPath() || '';
    
    if (!path) {
      console.warn('[repo2txt] No path provided');
      return;
    }

    // Set isAnalyzing BEFORE making RPC call to avoid race condition
    console.log('[repo2txt] 🔄 Setting isAnalyzing = true (BEFORE RPC call)');
    isAnalyzing.value = true;
    console.log('[repo2txt] ✅ isAnalyzing is now:', isAnalyzing.value);
    
    isLoading.value = true;

    // Safety timeout: if analysis doesn't complete in 30 seconds, reset the flag
    // This is a fallback in case the event doesn't arrive
    const analysisTimeout = setTimeout(() => {
      if (isAnalyzing.value) {
        console.warn('[repo2txt] ⚠️ Analysis timeout after 30s - resetting isAnalyzing flag (event may not have arrived)');
        console.warn('[repo2txt] This might indicate that the analysis-completed event was not received');
        console.log('[repo2txt] 🔄 Force setting isAnalyzing = false (timeout)');
        isAnalyzing.value = false;
        console.log('[repo2txt] ✅ isAnalyzing is now:', isAnalyzing.value);
      }
    }, 30000);

    try {
      console.log('[repo2txt] 📞 Calling repo2txt:open-directory RPC...');
      const resultNodes = await api.rpc.call<FileNode[]>(
        'repo2txt:open-directory',
        { path, config: config.value }
      );
      console.log('[repo2txt] 📥 RPC call completed, received nodes');

      // Check if path changed - if so, clear old config
      const previousPath = rootPath.value;
      if (previousPath && previousPath !== path) {
        console.log('[repo2txt] Path changed, clearing old config:', {
          previous: previousPath,
          new: path,
        });
        // Clear config for old path
        api.storage.remove('r2x-config');
      }

      nodes.value = resultNodes;
      rootPath.value = path;
      saveLastPath();
      
      // Load config from storage after nodes are set (wait for reactivity)
      await nextTick();
      loadConfigFromStorage();
      
      recalculateStats();

      console.log('[repo2txt] 📦 Received nodes from server:', resultNodes.length);
      console.log('[repo2txt] ⏳ Checking isAnalyzing state after receiving nodes...');
      console.log('[repo2txt] Current isAnalyzing state:', isAnalyzing.value);
      
      // If event already arrived (isAnalyzing is false), that's perfect - we're done
      // If event hasn't arrived yet (isAnalyzing is still true), we wait for it
      if (!isAnalyzing.value) {
        console.log('[repo2txt] ✅ Event already arrived, analysis is complete!');
      } else {
        console.log('[repo2txt] ⏳ Still waiting for analysis-completed event...');
      }
      
      // Clear timeout since we got nodes (event might come later)
      clearTimeout(analysisTimeout);
    } catch (error) {
      clearTimeout(analysisTimeout);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to open directory';
      
      console.error('[repo2txt] Error opening directory:', {
        path,
        error: errorMessage,
        errorObject: error,
      });
      
      // Show user-friendly error message
      api.notify(`Failed to open directory: ${errorMessage}`, 'error');
      
      // Reset analyzing state on error
      console.log('[repo2txt] ❌ Error occurred, resetting isAnalyzing = false');
      isAnalyzing.value = false;
      console.log('[repo2txt] ✅ isAnalyzing is now:', isAnalyzing.value);
      clearTimeout(analysisTimeout);
    } finally {
      console.log('[repo2txt] 🔄 Setting isLoading = false (finally block)');
      console.log('[repo2txt] Current isLoading before update:', isLoading.value);
      console.log('[repo2txt] Current isAnalyzing in finally:', isAnalyzing.value);
      isLoading.value = false;
      console.log('[repo2txt] ✅ isLoading is now:', isLoading.value);
    }
  }

  // Setup event listeners (only once globally)
  function setupListeners() {
    // Prevent multiple registrations across all instances
    if (listenersSetup) {
      console.log('[repo2txt] ⚠️ Listeners already setup, skipping...');
      return;
    }
    
    console.log('[repo2txt] 🔧 Setting up event listeners...');
    
    // Clean up existing listeners first (important for HMR)
    if (analysisCompletedUnsubscribe) {
      console.log('[repo2txt] 🧹 Cleaning up existing analysis-completed listener');
      analysisCompletedUnsubscribe();
      analysisCompletedUnsubscribe = null;
    }

    // Listen for analysis completion
    console.log('[repo2txt] 👂 Setting up listener for repo2txt:analysis-completed event');
    console.log('[repo2txt] 📋 Current isAnalyzing state before listener setup:', isAnalyzing.value);
    
    analysisCompletedUnsubscribe = api.rpc.on('repo2txt:analysis-completed', (data: unknown) => {
      console.log('[repo2txt] 📨 ========== RECEIVED repo2txt:analysis-completed event! ==========', data);
      console.log('[repo2txt] 🔄 Setting isAnalyzing = false');
      console.log('[repo2txt] Current isAnalyzing before update:', isAnalyzing.value);
      console.log('[repo2txt] 🔍 isAnalyzing ref object:', isAnalyzing);
      console.log('[repo2txt] 🔍 isAnalyzing.value:', isAnalyzing.value);
      
      // Always set to false when event arrives (even if already false)
      // This ensures UI updates correctly
      const wasTrue = isAnalyzing.value;
      isAnalyzing.value = false;
      console.log('[repo2txt] ✅ isAnalyzing changed from', wasTrue, 'to', isAnalyzing.value);
      console.log('[repo2txt] 🔍 After update - isAnalyzing.value:', isAnalyzing.value);
      console.log('[repo2txt] 🔍 After update - isAnalyzing ref object:', isAnalyzing);
      
      // Force Vue to trigger reactivity by using nextTick
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          console.log('[repo2txt] 🔍 After nextTick - isAnalyzing.value:', isAnalyzing.value);
        });
      });
      
      recalculateStats();
      console.log('[repo2txt] ✅ Stats recalculated after analysis completion');
    });
    
    console.log('[repo2txt] ✅ Listener registered for analysis-completed event');
    console.log('[repo2txt] 📋 Listener function:', analysisCompletedUnsubscribe !== null ? 'registered' : 'NOT registered');

    listenersSetup = true;
    
    // Generation progress is handled in Toolbar component
  }
  
  // Set up listeners immediately when composable is created (only once globally)
  setupListeners();

  // Recalculate statistics (optimized with caching)
  const selectedNodesCache = computed(() => {
    const selected = new Set<string>();
    const nodeMap = new Map<string, FileNode>();
    
    // Build node map for fast lookup
    for (const node of nodes.value) {
      nodeMap.set(node.id, node);
    }
    
    // Collect selected file nodes (not directories)
    for (const node of nodes.value) {
      if (node.selected && !node.is_directory) {
        // Check if parent is selected (if parent exists)
        if (node.parent_id) {
          const parent = nodeMap.get(node.parent_id);
          if (parent && !parent.selected) {
            continue;
          }
        }
        selected.add(node.id);
      }
    }
    
    return selected;
  });

  function recalculateStats() {
    let files = 0;
    let size = 0;
    let tokens = 0;

    const selected = selectedNodesCache.value;
    
    for (const nodeId of selected) {
      const node = nodes.value.find((n) => n.id === nodeId);
      if (!node || node.is_directory) continue;

      files++;
      if (node.size !== null) {
        size += node.size;
      }
      if (node.token_count !== null) {
        tokens += node.token_count;
      }
    }

    stats.value = { files, size, tokens };
  }

  // Toggle selection
  async function toggleSelection(nodeId: string) {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node) return;

    const newSelected = !node.selected;
    node.selected = newSelected;

    // Recursively update children if directory
    if (node.is_directory) {
      const updateChildren = (parentId: string) => {
        for (const child of nodes.value) {
          if (child.parent_id === parentId) {
            child.selected = newSelected;
            if (child.is_directory) {
              updateChildren(child.id);
            }
          }
        }
      };
      updateChildren(nodeId);
    }

    // Update on server
    await api.rpc.call('repo2txt:update-selection', {
      id: nodeId,
      selected: newSelected,
    });

    recalculateStats();
    // Auto-save config to storage when selection changes
    saveConfigToStorage();
  }

  // Toggle expanded
  async function toggleExpanded(nodeId: string) {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (!node || !node.is_directory) return;

    const wasExpanded = node.expanded;
    node.expanded = !node.expanded;

    await api.rpc.call('repo2txt:toggle-expanded', {
      id: nodeId,
      expanded: node.expanded,
    });

    // Auto-save config to storage when expansion changes
    saveConfigToStorage();

    // If expanding and no children, scan directory
    if (node.expanded && !wasExpanded) {
      const existingChildren = nodes.value.filter((n) => n.parent_id === nodeId);
      if (existingChildren.length === 0) {
        loadingNodes.value.add(nodeId);
        try {
          const resultNodes = await api.rpc.call<FileNode[]>(
            'repo2txt:scan-directory',
            { id: nodeId, config: config.value }
          );

          // Add only new children
          const existingIds = new Set(nodes.value.map((n) => n.id));
          const newChildren = resultNodes.filter((child) => !existingIds.has(child.id));
          nodes.value.push(...newChildren);
        } finally {
          loadingNodes.value.delete(nodeId);
        }
      }
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim()) {
      try {
        const results = await api.rpc.call<string[]>(
          'repo2txt:search-nodes',
          { query }
        );

        searchResults.value = results;
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'string' 
          ? error 
          : 'Search failed';
        
        console.error('[repo2txt] Search failed:', {
          query,
          error: errorMessage,
          errorObject: error,
        });
        
        searchResults.value = [];
      }
    } else {
      searchResults.value = [];
    }
  }, 300);

  // Search nodes (with debounce)
  async function searchNodes(query: string) {
    searchQuery.value = query;
    
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      searchResults.value = [];
    }
  }

  // Generate markdown (no file output - content is stored in cache for clipboard)
  async function generateMarkdown(): Promise<GenerateResult | null> {
    try {
      // Get current selection state from client to ensure server uses latest state
      const selectedNodeIds = nodes.value
        .filter((n) => !n.is_directory && n.selected)
        .map((n) => n.id);
      
      const result = await api.rpc.call<GenerateResult>('repo2txt:generate-markdown', {
        config: config.value,
        selectedNodeIds, // Send current selection to ensure server uses latest state
      });

      stats.value = result.stats;
      
      // Save config to storage if returned from server
      if (result.config) {
        api.storage.set('r2x-config', result.config as R2XConfig);
      } else {
        // Fallback: generate config from current state
        saveConfigToStorage();
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to generate markdown';
      
      console.error('[repo2txt] Error generating markdown:', {
        error: errorMessage,
        errorObject: error,
      });
      
      throw new Error(`Failed to generate markdown: ${errorMessage}`);
    }
  }

  // Copy from cache to clipboard
  async function copyFromCache(): Promise<void> {
    try {
      const result = await api.rpc.call<{ content: string }>('repo2txt:copy-from-cache', {
        rootPath: rootPath.value,
      });

      await navigator.clipboard.writeText(result.content);
      api.notify('Full content copied to clipboard!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to copy from cache';
      
      console.error('[repo2txt] Failed to copy from cache:', {
        rootPath: rootPath.value,
        error: errorMessage,
        errorObject: error,
      });
      
      api.notify(`Failed to copy content: ${errorMessage}`, 'error');
      throw new Error(`Failed to copy content: ${errorMessage}`);
    }
  }

  // Select all files
  async function selectAll() {
    for (const node of nodes.value) {
      if (!node.is_directory && !node.selected) {
        node.selected = true;
      }
    }
    recalculateStats();
    saveConfigToStorage();
  }

  // Deselect all files
  async function deselectAll() {
    for (const node of nodes.value) {
      if (node.selected) {
        node.selected = false;
      }
    }
    recalculateStats();
    saveConfigToStorage();
  }

  // Collapse all
  function collapseAll() {
    for (const node of nodes.value) {
      if (node.is_directory && node.expanded) {
        node.expanded = false;
        api.rpc.call('repo2txt:toggle-expanded', {
          id: node.id,
          expanded: false,
        }).catch((err) => {
          console.error('[repo2txt] Failed to collapse node:', err);
        });
      }
    }
    saveConfigToStorage();
  }

  // Read file content
  async function readFile(nodeId: string): Promise<string | null> {
    try {
      const content = await api.rpc.call<string>('repo2txt:read-file', { id: nodeId });
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to read file';
      
      const node = nodes.value.find((n) => n.id === nodeId);
      console.error('[repo2txt] Error reading file:', {
        nodeId,
        path: node?.path || 'unknown',
        error: errorMessage,
        errorObject: error,
      });
      
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }

  // Navigate to parent directory
  async function navigateToParent() {
    if (!rootPath.value) return;

    try {
      const parentPath = await api.rpc.call<string | null>('repo2txt:get-parent-directory', {
        path: rootPath.value,
      });

      if (parentPath) {
        await openDirectory(parentPath);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to navigate to parent directory';
      
      console.error('[repo2txt] Failed to navigate to parent:', {
        currentPath: rootPath.value,
        error: errorMessage,
        errorObject: error,
      });
      
      const api = useApi();
      api.notify(`Failed to navigate: ${errorMessage}`, 'error');
    }
  }

  // Reveal in explorer
  async function revealInExplorer(targetPath?: string) {
    const path = targetPath || rootPath.value;
    if (!path) return;

    try {
      await api.rpc.call('repo2txt:reveal-in-explorer', { path });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Failed to reveal in explorer';
      
      console.error('[repo2txt] Failed to reveal in explorer:', {
        path,
        error: errorMessage,
        errorObject: error,
      });
      
      const api = useApi();
      api.notify(`Failed to reveal in explorer: ${errorMessage}`, 'error');
    }
  }


  return {
    // State
    nodes,
    rootPath,
    stats,
    isLoading,
    isAnalyzing,
    selectedFilePath,
    loadingNodes,
    searchQuery,
    searchResults,
    focusedNodeId,
    config,
    // Computed
    visibleRows,
    // Methods
    openDirectory,
    setupListeners,
    recalculateStats,
    toggleSelection,
    toggleExpanded,
    searchNodes,
    generateMarkdown,
    selectAll,
    deselectAll,
    collapseAll,
    readFile,
    navigateToParent,
    revealInExplorer,
    copyFromCache,
    clearConfig,
    api, // Expose api for external use if needed
  };
}
