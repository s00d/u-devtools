/**
 * Types for Vue Inspector plugin
 */

// Import types from @vue/devtools-kit for use in this file
import type {
  CustomInspectorNode,
  CustomInspectorState,
  InspectorNodeTag,
  EditStatePayload,
} from '@vue/devtools-kit';

// Re-export types from @vue/devtools-kit
export type {
  CustomInspectorNode,
  CustomInspectorState,
  InspectorNodeTag,
  EditStatePayload,
} from '@vue/devtools-kit';

// Component types
export interface ComponentTreeNode {
  id: string;
  name: string;
  uid?: string | number;
  file?: string;
  line?: number;
  column?: number;
  children?: ComponentTreeNode[];
  tags?: Array<{ label: string; textColor?: number; backgroundColor?: number; tooltip?: string }>;
  inactive?: boolean;
  isFragment?: boolean;
  renderKey?: number | string;
  hasChildren?: boolean;
  isRouterView?: boolean;
  matchedRouteSegment?: string;
  autoOpen?: boolean;
  meta?: unknown;
}

export interface ComponentState {
  props?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  data?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  computed?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  methods?: string[];
  setupState?: Record<string, unknown>;
  attrs?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  provide?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  inject?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  refs?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
}

export interface ComponentInstanceInfo {
  id: string;
  name: string;
  file?: string;
  line?: number;
  column?: number;
}

// Pinia types
export interface PiniaStoreNode {
  id: string;
  label: string;
  name?: string;
  children?: PiniaStoreNode[];
  tags?: Array<{ label: string; textColor?: number; backgroundColor?: number; tooltip?: string }>;
}

export interface PiniaStoreState {
  state?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
  getters?: Array<{
    key: string;
    type: string;
    value: unknown;
    editable: boolean;
  }>;
}

// Router types
export interface RouteInfo {
  currentRoute?: RouteRecord;
  routes?: RouteRecord[];
  history?: RouteRecord[];
}

export interface RouteRecord {
  path: string;
  name?: string;
  component?: string;
  meta?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  hash?: string;
  matched?: RouteRecord[];
  redirectedFrom?: string;
}

// Timeline types
export interface TimelineEvent {
  id: string;
  time: number;
  type: 'component' | 'pinia' | 'router' | 'custom';
  layerId: string;
  title: string;
  subtitle?: string;
  data?: unknown;
  meta?: Record<string, unknown>;
}

export interface TimelineLayer {
  id: string;
  label: string;
  color?: string;
  events: TimelineEvent[];
}

// Virtual Router types (for tabs)
export interface VirtualRoute {
  path: string;
  name: string;
  component: unknown; // Vue component
  icon?: string;
}

// Extended EditStatePayload for Vue Inspector
export interface VueInspectorEditStatePayload {
  inspectorId: string;
  nodeId: string;
  path: string;
  type: string;
  value: unknown;
  newKey?: string | null;
  remove?: boolean;
}

/**
 * Protocol definition for Vue Inspector plugin
 */
export interface VueInspectorProtocol {
  // Events sent from App to Client
  'inspector:ready': (data: {
    vueVersion: string;
    hasPinia: boolean;
    hasRouter: boolean;
  }) => void;
  'inspector:appsList': (data: Array<{ id: string; name: string; version: string }>) => void;
  'inspector:componentTree': (tree: ComponentTreeNode[]) => void;
  'inspector:componentState': (state: ComponentState | null) => void;
  'inspector:componentRenderCode': (data: { code: string }) => void;
  'inspector:inspectComponentInspector:result': (data: { data: unknown | null }) => void;
  'inspector:piniaTree': (tree: CustomInspectorNode[]) => void;
  'inspector:piniaState': (state: Record<string, CustomInspectorState[]> | Record<string, never>) => void;
  'inspector:routerInfo': (info: RouteInfo | null) => void;
  'inspector:timelineLayers': (layers: TimelineLayer[]) => void;
  'inspector:timelineEvents': (events: TimelineEvent[]) => void;
  'inspector:component-selected': (data: { id: string; uid?: number; appId?: string }) => void;
  'inspector:disabled': (data: {}) => void;

  // Events sent from Client to App
  'inspector:enable': () => void;
  'inspector:disable': () => void;
  'inspector:getComponentTree': (payload: { filter?: string; appId?: string }) => void;
  'inspector:getComponentState': (payload: { id: string; appId?: string }) => void;
  'inspector:editState': (payload: VueInspectorEditStatePayload) => void;
  'inspector:scrollToComponent': (payload: { id: string }) => void;
  'inspector:highlight': (payload: { id: string }) => void;
  'inspector:unhighlight': () => void;
  'inspector:getComponentRenderCode': (payload: { nodeId: string }) => void;
  'inspector:inspectComponentInspector': () => void;
  'inspector:cancelInspectComponentInspector': () => void;
  'inspector:getPiniaTree': (payload: { filter?: string }) => void;
  'inspector:getPiniaState': (payload: { nodeId: string }) => void;
  'inspector:editPiniaState': (payload: Omit<VueInspectorEditStatePayload, 'inspectorId'>) => void;
  'inspector:getRouterInfo': () => void;
  'inspector:navigateToRoute': (payload: { path: string }) => void;
  'inspector:getTimelineLayers': () => void;
  'inspector:getTimelineEvents': (payload: { layerId?: string }) => void;
  'inspector:getAppsList': () => void;
  'inspector:switchApp': (payload: { appId: string }) => void;
}
