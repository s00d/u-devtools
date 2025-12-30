/**
 * Types for Vue Inspector plugin
 */

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
