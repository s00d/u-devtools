import { AppBridge } from '@u-devtools/core';
import { 
  initDevTools, 
  onDevToolsConnected,
  devtools,
  activeAppRecord,
  setDevToolsEnv,
  getInspector,
} from '@vue/devtools-kit';

const bridge = new AppBridge('vue-inspector');

// Set environment to indicate vite plugin is detected
setDevToolsEnv({
  vitePluginDetected: true,
});

// Initialize @vue/devtools-kit
initDevTools();

// Flag to track connection
let isConnected = false;
let hasPinia = false;
let hasRouter = false;

// Check available inspectors
function checkAvailableInspectors() {
  try {
    hasPinia = !!getInspector('pinia');
    hasRouter = !!getInspector('router');
  } catch {
    // Ignore
  }
}

// Listen for Vue app connection
onDevToolsConnected(() => {
  console.log('[Vue Inspector] Connected to Vue App');
  isConnected = true;
  checkAvailableInspectors();
  bridge.send('inspector:ready', { 
    enabled: true,
    hasPinia,
    hasRouter,
  });
});

// Helper to serialize data (devtools-kit returns complex objects)
// Recursively removes functions and other non-serializable values
function serialize<T>(data: T): T {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: unknown): unknown => {
    // Remove functions
    if (typeof value === 'function') {
      return undefined;
    }
    // Remove native code objects (like String constructor)
    if (value && typeof value === 'object') {
      const proto = Object.getPrototypeOf(value);
      if (proto && proto.constructor && proto.constructor.name === 'String') {
        return String(value);
      }
      // Handle circular references
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
  
  try {
    const result = JSON.parse(JSON.stringify(data, replacer)) as T;
    return result;
  } catch (e) {
    console.warn(`[Vue Inspector] Serialization error: ${e instanceof Error ? e.message : String(e)}`);
    // Return empty object/array/null as fallback
    if (Array.isArray(data)) {
      return [] as T;
    }
    if (data && typeof data === 'object') {
      return {} as T;
    }
    return null as T;
  }
}

// --- COMPONENT TREE ---

bridge.on('inspector:getComponentTree', async (payload: { filter?: string }) => {
  if (!isConnected) {
    bridge.send('inspector:componentTree', []);
    return;
  }
  try {
    const tree = await devtools.ctx.api.getInspectorTree({ 
      inspectorId: 'components', 
      filter: payload.filter || '' 
    });
    bridge.send('inspector:componentTree', serialize(tree || []));
  } catch (e) {
    console.error(`[Vue Inspector] getComponentTree error: ${e instanceof Error ? e.message : String(e)}`);
    bridge.send('inspector:componentTree', []);
  }
});

// --- COMPONENT STATE ---

// Helper to normalize component state from CustomInspectorState to ComponentState format
function normalizeComponentState(data: any): any {
  if (!data) {
    return null;
  }
  
  // Check if data has a 'state' property (CustomInspectorState format)
  const stateArray = data.state;
  if (!stateArray || !Array.isArray(stateArray)) {
    console.warn(`[Vue Inspector] State is not an array. Data keys: ${data ? Object.keys(data).join(', ') : 'null'}`);
    return null;
  }
  
  // Initialize result structure
  const props: any[] = [];
  const dataItems: any[] = [];
  const computed: any[] = [];
  const setupStateItems: any[] = [];
  const methods: any[] = [];
  const attrs: any[] = [];
  const provide: any[] = [];
  const inject: any[] = [];
  const refs: any[] = [];
  
  // Group states by type and stateType
  stateArray.forEach((item: any, index: number) => {
    // Log first few items to understand structure
    if (index < 3) {
      console.log(`[Vue Inspector] State item ${index}: key="${item.key}", type="${item.type}", stateType="${item.stateType || item.stateTypeName || 'none'}", valueType="${typeof item.value}"`);
    }
    
    const itemType = item.type || '';
    const stateType = item.stateType || item.stateTypeName || '';
    const valueType = typeof item.value;
    
    const stateItem = {
      key: item.key,
      type: item.type || 'unknown',
      value: item.value,
      editable: item.editable !== false,
    };
    
    // Handle props
    if (itemType === 'props' || stateType === 'props') {
      props.push(stateItem);
    }
    // Handle data
    else if (itemType === 'data' || stateType === 'data') {
      dataItems.push(stateItem);
    }
    // Handle computed
    else if (itemType === 'computed' || stateType === 'computed') {
      computed.push(stateItem);
    }
    // Handle setup state (reactive, ref from setup)
    else if (itemType === 'setup' && (stateType === 'reactive' || stateType === 'ref')) {
      setupStateItems.push(stateItem);
    }
    // Handle methods (functions)
    else if (valueType === 'function' || itemType.includes('method') || itemType.includes('(other)')) {
      methods.push(stateItem);
    }
    // Handle attrs
    else if (itemType === 'attrs' || stateType === 'attrs') {
      attrs.push(stateItem);
    }
    // Handle provide
    else if (itemType === 'provide' || stateType === 'provide' || stateType === 'provided') {
      provide.push(stateItem);
    }
    // Handle inject
    else if (itemType === 'inject' || stateType === 'inject') {
      inject.push(stateItem);
    }
    // Handle refs
    else if (itemType === 'refs' || stateType === 'refs') {
      refs.push(stateItem);
    }
    // Handle event listeners
    else if (itemType === 'event listeners' || stateType === 'event listeners') {
      // Event listeners can be ignored or added to methods
      // For now, we'll ignore them
    }
    // Fallback: if it's a setup-related item, add to setupState
    else if (itemType === 'setup' || itemType.includes('setup')) {
      setupStateItems.push(stateItem);
    }
  });
  
  // Convert setupState array to object
  const setupStateObj = setupStateItems.length > 0 ? setupStateItems.reduce((acc: any, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {}) : undefined;
  
  const normalized = {
    props,
    data: dataItems,
    computed,
    setupState: setupStateObj,
    methods,
    attrs,
    provide,
    inject,
    refs,
  };
  
  // Log for debugging
  const setupStateKeys = setupStateObj ? Object.keys(setupStateObj).join(', ') : 'none';
  console.log(`[Vue Inspector] normalizeComponentState result: arrayLength=${stateArray.length}, props=${normalized.props.length}, data=${normalized.data.length}, computed=${normalized.computed.length}, setupState=[${setupStateKeys}], methods=${normalized.methods.length}`);
  
  return normalized;
}

bridge.on('inspector:getComponentState', async (payload: { id: string }) => {
  if (!isConnected) {
    bridge.send('inspector:componentState', null);
    return;
  }
  try {
    console.log(`[Vue Inspector] getComponentState requested: id="${payload.id}"`);
    const state = await devtools.ctx.api.getInspectorState({ 
      inspectorId: 'components', 
      nodeId: payload.id 
    });
    
    const stateKeys = state ? Object.keys(state).join(', ') : 'none';
    const stateType = state?.state ? (Array.isArray(state.state) ? 'array' : typeof state.state) : 'none';
    const stateArrayLength = state?.state ? (Array.isArray(state.state) ? state.state.length : 0) : 0;
    console.log(`[Vue Inspector] getComponentState raw result: hasState=${!!state}, stateKeys=[${stateKeys}], stateType=${stateType}, stateArrayLength=${stateArrayLength}`);
    
    // Normalize state to ComponentState format
    const normalized = normalizeComponentState(state);
    const hasProps = !!(normalized?.props?.length);
    const hasData = !!(normalized?.data?.length);
    const hasComputed = !!(normalized?.computed?.length);
    const hasSetupState = !!normalized?.setupState;
    const hasMethods = !!(normalized?.methods?.length);
    console.log(`[Vue Inspector] getComponentState normalized: props=${hasProps}, data=${hasData}, computed=${hasComputed}, setupState=${hasSetupState}, methods=${hasMethods}`);
    
    bridge.send('inspector:componentState', serialize(normalized || null));
  } catch (e) {
    console.error(`[Vue Inspector] getComponentState error: ${e instanceof Error ? e.message : String(e)}`);
    bridge.send('inspector:componentState', null);
  }
});

// --- EDIT COMPONENT STATE ---

interface EditStatePayload {
  inspectorId: string;
  nodeId: string;
  path: string[];
  type: 'state' | 'getters';
  value: unknown;
}

bridge.on('inspector:editState', async (payload: EditStatePayload) => {
  if (!isConnected) return;
  try {
    // editInspectorState expects a state object with value property
    // The API will add app and set function automatically
    devtools.ctx.api.editInspectorState({
      inspectorId: payload.inspectorId,
      nodeId: payload.nodeId,
      path: payload.path,
      state: { 
        value: payload.value,
      } as any, // Type assertion needed as API adds app and set internally
      type: payload.type,
    } as any);
    // Refresh state after edit
    const state = await devtools.ctx.api.getInspectorState({ 
      inspectorId: payload.inspectorId, 
      nodeId: payload.nodeId 
    });
    bridge.send('inspector:componentState', serialize(state || null));
  } catch (e) {
    console.error(`[Vue Inspector] editState error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

// --- PINIA ---

bridge.on('inspector:getPiniaTree', async (payload: { filter?: string }) => {
  if (!isConnected) {
    bridge.send('inspector:piniaTree', []);
    return;
  }
  try {
    const tree = await devtools.ctx.api.getInspectorTree({ 
      inspectorId: 'pinia', 
      filter: payload.filter || '' 
    });
    bridge.send('inspector:piniaTree', serialize(tree || []));
  } catch (e) {
    // Pinia may not be installed
    bridge.send('inspector:piniaTree', []);
  }
});

bridge.on('inspector:getPiniaState', async (payload: { nodeId: string }) => {
  if (!isConnected) {
    bridge.send('inspector:piniaState', {});
    return;
  }
  try {
    const state = await devtools.ctx.api.getInspectorState({ 
      inspectorId: 'pinia', 
      nodeId: payload.nodeId 
    });
    bridge.send('inspector:piniaState', serialize(state || {}));
  } catch (e) {
    // Pinia may not be installed
    bridge.send('inspector:piniaState', {});
  }
});

// --- EDIT PINIA STATE ---

bridge.on('inspector:editPiniaState', async (payload: { 
  nodeId: string;
  path: string[];
  type: 'state' | 'getters';
  value: unknown;
}) => {
  if (!isConnected || !hasPinia) return;
  try {
    // The API will add app and set function automatically
    devtools.ctx.api.editInspectorState({
      inspectorId: 'pinia',
      nodeId: payload.nodeId,
      path: payload.path,
      state: { 
        value: payload.value,
      } as any, // Type assertion needed as API adds app and set internally
      type: payload.type,
    } as any);
    // Refresh state after edit
    const state = await devtools.ctx.api.getInspectorState({ 
      inspectorId: 'pinia', 
      nodeId: payload.nodeId 
    });
    bridge.send('inspector:piniaState', serialize(state || {}));
  } catch (e) {
    console.error(`[Vue Inspector] editPiniaState error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

// --- ROUTER ---
// Router info via direct instance access
bridge.on('inspector:getRouterInfo', () => {
  if (!activeAppRecord.value) {
    bridge.send('inspector:routerInfo', null);
    return;
  }
  
  // Try to find router in global properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = (activeAppRecord.value.app as any)?.config?.globalProperties?.$router;
  
  if (!router) {
    bridge.send('inspector:routerInfo', null);
    return;
  }

  // Collect data manually for better UI compatibility
  try {
    const info = {
      currentRoute: router.currentRoute.value,
      routes: router.getRoutes().map((r: any) => ({
        path: r.path,
        name: r.name,
        meta: r.meta,
        aliasOf: r.aliasOf ? r.aliasOf.path : undefined
      }))
    };

    bridge.send('inspector:routerInfo', serialize(info));
  } catch (e) {
    console.error(`[Vue Inspector] getRouterInfo error: ${e instanceof Error ? e.message : String(e)}`);
    bridge.send('inspector:routerInfo', null);
  }
});

bridge.on('inspector:navigateToRoute', async (payload: { path: string }) => {
  if (!activeAppRecord.value) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const router = (activeAppRecord.value.app as any)?.config?.globalProperties?.$router;
    if (router) {
      router.push(payload.path);
      // Refresh router info after navigation
      setTimeout(() => {
        const info = {
          currentRoute: router.currentRoute.value,
          routes: router.getRoutes().map((r: any) => ({
            path: r.path,
            name: r.name,
            meta: r.meta,
            aliasOf: r.aliasOf ? r.aliasOf.path : undefined
          }))
        };
        bridge.send('inspector:routerInfo', serialize(info));
      }, 100);
    }
  } catch (e) {
    console.error(`[Vue Inspector] navigateToRoute error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

// --- TIMELINE ---
// Timeline events are managed via hooks in devtools-kit
// For now, return empty arrays - can be extended later when Timeline API is fully available

bridge.on('inspector:getTimelineLayers', async () => {
  if (!isConnected) {
    bridge.send('inspector:timelineLayers', []);
    return;
  }
  // Timeline layers API may not be available directly
  // Return empty array for now
  bridge.send('inspector:timelineLayers', []);
});

bridge.on('inspector:getTimelineEvents', async (payload: { layerId?: string }) => {
  if (!isConnected) {
    bridge.send('inspector:timelineEvents', []);
    return;
  }
  // Timeline events API may not be available directly
  // Return empty array for now
  bridge.send('inspector:timelineEvents', []);
});

// --- ACTIONS (Highlight/Scroll) ---

bridge.on('inspector:scrollToComponent', (payload: { id: string }) => {
  if (!isConnected || !activeAppRecord.value) return;
  try {
    devtools.ctx.api.scrollToComponent(payload.id);
  } catch (e) {
    console.error(`[Vue Inspector] scrollToComponent error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

bridge.on('inspector:highlight', (payload: { id: string }) => {
  if (!isConnected || !activeAppRecord.value) return;
  try {
    // Use inspectComponentInspector to highlight
    devtools.ctx.api.inspectComponentInspector();
  } catch (e) {
    console.error(`[Vue Inspector] highlight error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

bridge.on('inspector:unhighlight', () => {
  if (!isConnected) return;
  try {
    // Use cancelInspectComponentInspector to unhighlight
    devtools.ctx.api.cancelInspectComponentInspector();
  } catch (e) {
    console.error(`[Vue Inspector] unhighlight error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

// --- GET COMPONENT RENDER CODE ---

bridge.on('inspector:getComponentRenderCode', async (payload: { nodeId: string }) => {
  if (!isConnected) return;
  try {
    const code = devtools.ctx.api.getComponentRenderCode?.(payload.nodeId) || '';
    bridge.send('inspector:componentRenderCode', { code });
  } catch (e) {
    console.error(`[Vue Inspector] getComponentRenderCode error: ${e instanceof Error ? e.message : String(e)}`);
    bridge.send('inspector:componentRenderCode', { code: '' });
  }
});

// --- INSPECT COMPONENT INSPECTOR ---

bridge.on('inspector:inspectComponentInspector', async () => {
  if (!isConnected) return;
  try {
    const data = await devtools.ctx.api.inspectComponentInspector();
    bridge.send('inspector:inspectComponentInspector:result', { data: data ? JSON.parse(data) : null });
  } catch (e) {
    console.error(`[Vue Inspector] inspectComponentInspector error: ${e instanceof Error ? e.message : String(e)}`);
    bridge.send('inspector:inspectComponentInspector:result', { data: null });
  }
});

bridge.on('inspector:cancelInspectComponentInspector', () => {
  if (!isConnected) return;
  try {
    devtools.ctx.api.cancelInspectComponentInspector();
  } catch (e) {
    console.error(`[Vue Inspector] cancelInspectComponentInspector error: ${e instanceof Error ? e.message : String(e)}`);
  }
});

// --- CLEANUP ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hot = (import.meta as unknown as Record<string, unknown>).hot as { dispose: (cb: () => void) => void } | undefined;
if (hot) {
  hot.dispose(() => {
    bridge.close();
  });
}
