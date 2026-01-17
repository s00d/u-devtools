/**
 * Protocol definition for Library plugin
 */
export interface LibraryProtocol {
  // Events sent from App to Client
  'element-selected': (data: { html: string }) => void;

  // Events sent from Client to App
  'library:inject-code': (data: { code: string }) => void;
  
  // УДАЛЕНЫ: 'toggle-inspector', 'inspector-active', 'library:toggle-inspector', 'library:inspector-state'
  // Вместо них используется bridge.state('isInspecting')
}

/**
 * Component snippet definition
 */
export interface ComponentSnippet {
  id: string;
  name: string;
  category?: string;
  html: string;
  description?: string;
  tags?: string[];
  isCustom?: boolean;
}
