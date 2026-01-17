/**
 * Protocol definition for Storage plugin
 */
export interface StorageProtocol {
  // Events sent from App to Client
  'data': (data: {
    local: Array<{ key: string; value: unknown }>;
    session: Array<{ key: string; value: unknown }>;
    cookie: Array<{ key: string; value: string; httpOnly: boolean }>;
    indexeddb: Array<{
      name: string;
      version?: number;
      stores?: Array<{ name: string; entries: Array<{ key: unknown; value: unknown }> }>;
      error?: string;
    }>;
    cache: unknown[];
    opfs: unknown[];
  }) => void;
  'error': (error: string) => void;

  // Events sent from Client to App
  'refresh': () => void;
  'save': (payload: unknown) => void;
  'delete': (payload: unknown) => void;
  'clear': (payload: unknown) => void;
}

