/**
 * Protocol definition for Inspector plugin
 */
export interface InspectorProtocol {
  // Events sent from App to Client
  'element-picked': (data: {
    udtId: string;
    tagName: string;
    id: string;
    classes: string[];
    attrs: Record<string, string>;
    innerText: string;
    rect: { x: number; y: number; width: number; height: number };
    styles: any;
    computed: any;
    breadcrumbs: Array<{ tagName: string; id: string; class: string }>;
    a11y: any;
    colors: any;
    domContext: any;
  }) => void;
  'inspector-cancelled': (data: {}) => void;

  // Events sent from Client to App
  'restore-selection': (data: { selector: string }) => void;
  'clear-selection': (data: Record<string, never>) => void;
  // УДАЛЕНО: 'toggle-inspector' - теперь используется bridge.state('isInspecting')
  'highlight': (data: {}) => void;
  'update-attr': (data: { udtId?: string; name: string; value: string }) => void;
  'remove-attr': (data: { udtId?: string; name: string }) => void;
  'update-text': (data: { udtId?: string; text: string }) => void;
  'delete-node': (data: { udtId?: string }) => void;
  'scroll-into-view': (data: { udtId?: string }) => void;
  'log-node': (data: { udtId?: string }) => void;
  'add-class': (data: { udtId?: string; cls: string }) => void;
  'remove-class': (data: { udtId?: string; cls: string }) => void;
  'toggle-class': (data: { udtId?: string; cls: string; active: boolean }) => void;
  'update-classes': (data: { udtId?: string; classes: string[] }) => void;
  'update-style': (data: { udtId?: string; prop: string; value: string }) => void;
  'focus-node': (data: { udtId?: string }) => void;
  'toggle-visibility': (data: { udtId?: string; mode: 'hide' | 'remove' }) => void;
  'select-node': (data: {
    type: 'parent' | 'sibling' | 'child';
    index?: number;
    currentElement?: { tagName: string; id: string; classes: string };
  }) => void;
}

