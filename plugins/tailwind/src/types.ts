export interface TailwindConfigSummary {
  theme: {
    colors: Record<string, string | Record<string, string>>;
    spacing: Record<string, string>;
    screens: Record<string, string>;
    fontFamily: Record<string, string | string[]>;
    fontSize: Record<string, [string, { lineHeight: string }]>;
    borderRadius: Record<string, string>;
    boxShadow: Record<string, string>;
  };
}

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
}

export interface ElementState {
  udtId: string;
  tagName: string;
  classList: string[];
  computed: Record<string, string>;
  source: SourceLocation | null; // Always present (may be null if not found)
  textContent?: string; // New field for text content
}

export interface ClassToken {
  raw: string; // "hover:bg-red-500"
  utility: string; // "bg-red-500"
  variant: string; // "hover"
  prefix: string; // "bg"
  value: string; // "red-500"
  important: boolean;
}

/**
 * Protocol definition for Tailwind plugin
 */
export interface TailwindProtocol {
  // Events sent from App to Client
  'element-update': (state: ElementState) => void;
  'save-status': (data: { status: 'start' | 'success' | 'error' }) => void;

  // Events sent from Client to App
  'update-classes': (data: { udtId: string; classes: string[] }) => void;
  'restore-selection': (data: { loc: string }) => void;
  'clear-selection': (data: Record<string, never>) => void;
  'magic-fix': (data: Record<string, never>) => void;
  'request-save': (data: Record<string, never>) => void;
  'show-layout-overlay': (data: { udtId: string; showPadding: boolean; showMargin: boolean }) => void;
  'hide-layout-overlay': (data: Record<string, never>) => void;
  'simulate-state': (data: { udtId: string; states: string[] }) => void;
  
  // Events sent from App to Client (for storage)
  'save-last-loc': (data: { loc: string }) => void;
  'clear-last-loc': (data: Record<string, never>) => void;
  
  // УДАЛЕНЫ: 'toggle-inspector', 'toggle-design-mode', 'inspector-active'
  // Вместо них используются bridge.state('isInspecting') и bridge.state('isDesignMode')
}
