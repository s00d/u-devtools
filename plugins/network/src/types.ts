export type NetworkResourceType = 
  | 'fetch' 
  | 'xhr' 
  | 'websocket' 
  | 'eventsource' 
  | 'beacon' 
  | 'webtransport' // HTTP/3
  | 'resource';    // img, css, script (via PerformanceObserver)

export type ProtocolType = 
  | 'http' 
  | 'graphql' 
  | 'grpc' 
  | 'json-rpc' 
  | 'unknown';

export interface MockRule {
  id: string;
  active: boolean;
  method: string; // 'GET', 'POST', '*', etc.
  urlMatcher: string; // String for new RegExp() or partial match
  responseStatus: number;
  responseDelay: number; // ms
  responseType: 'json' | 'text';
  responseBody: string;
  responseHeaders: Record<string, string>;
}

export interface WebSocketFrame {
  id: string;
  time: number;
  type: 'send' | 'received';
  data: string | ArrayBuffer | Blob;
  opCode?: string;
}

export interface NetworkRequest {
  id: string;
  url: string;
  method: string; // GET, POST, or Operation Name (for GQL/RPC)
  type: NetworkResourceType;
  subType?: ProtocolType; // Specific protocol (GraphQL, gRPC, JSON-RPC)
  clientLibrary?: string; // 'Axios', 'Apollo', 'TanStack Query', etc.
  status?: number;
  statusText?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  error?: string;
  isMock?: boolean;
  // Для WebSockets и SSE
  frames?: WebSocketFrame[];
  readyState?: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  size?: number; // Size in bytes (from Performance API)
}

/**
 * Protocol definition for Network plugin
 */
export interface NetworkProtocol {
  // HTTP / Fetch / XHR / Beacon
  'request-start': (data: {
    id: string;
    url: string;
    method: string;
    type: NetworkResourceType;
    subType?: ProtocolType;
    clientLibrary?: string; // 'Axios', 'Apollo', 'TanStack Query', etc.
    startTime: number;
    requestHeaders: Record<string, string>;
    requestBody?: unknown;
    isMock?: boolean;
  }) => void;
  'request-end': (data: {
    id: string;
    status: number;
    statusText: string;
    endTime: number;
    duration: number;
  }) => void;
  'request-details': (data: {
    id: string;
    responseBody: unknown;
    responseHeaders: Record<string, string>;
  }) => void;
  'request-error': (data: {
    id: string;
    error: string;
    endTime: number;
    duration: number;
  }) => void;

  // WebSocket / SSE / WebTransport Specific
  'ws-open': (data: { 
    id: string; 
    url: string; 
    startTime: number; 
    type: 'websocket' | 'eventsource' | 'webtransport'
  }) => void;
  'ws-frame': (data: { 
    id: string; 
    frame: WebSocketFrame 
  }) => void;
  'ws-close': (data: { 
    id: string; 
    endTime: number; 
    code?: number; 
    reason?: string 
  }) => void;
  'ws-error': (data: { 
    id: string; 
    error: string; 
    endTime: number 
  }) => void;

  // Events sent from Client to App
  'update-mock-rules': (rules: MockRule[]) => void;
  'replay': (data: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: unknown;
  }) => void;
}
