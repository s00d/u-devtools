/**
 * Protocol definition for componentsbook plugin
 */
export interface ComponentsbookProtocol {
  // Events sent from Client to App
  'componentsbook:select-story': (data: { path: string; slots?: Record<string, any> }) => void;
  'componentsbook:update-props': (data: { props: Record<string, any> }) => void;
  // Events sent from App to Client (for RPC-like communication)
  'componentsbook:request-story-path': (data: { path: string }) => void;
  'componentsbook:story-path-response': (data: { path: string; resolvedPath: string }) => void;
}

/**
 * Prop metadata from vue-docgen-api
 */
export interface PropMeta {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
  values?: string[]; // for enum/union
}

/**
 * Event metadata from vue-docgen-api
 */
export interface EventMeta {
  name: string;
  description?: string;
}

/**
 * Slot metadata from vue-docgen-api
 */
export interface SlotMeta {
  name: string;
  description?: string;
  bindings?: string; // formatted bindings string
}

/**
 * Component metadata
 */
export interface ComponentMeta {
  props: PropMeta[];
  events: EventMeta[];
  slots: SlotMeta[];
}

/**
 * Story file information
 */
export interface StoryFile {
  id: string; // unique id (path based)
  path: string; // relative path
  name: string; // file name
}

/**
 * Action log entry for event tracking
 */
export interface ActionLog {
  id: string;
  name: string;
  payload: any[];
  timestamp: number;
}

/**
 * Canvas settings for preview
 */
export interface CanvasSettings {
  zoom: number;
  background: 'light' | 'dark' | 'grid' | 'transparent';
  viewport: {
    width: string; // '100%' or '375px'
    height: string; // '100%' or '667px'
    name: 'responsive' | 'mobile' | 'tablet' | 'desktop';
    rotate: boolean;
  };
}

/**
 * Component props metadata for UI controls
 */
export interface ComponentPropsMeta {
  [key: string]: {
    fieldType: 'text' | 'select' | 'checkbox' | 'number' | 'json';
    options?: string[];
  };
}
