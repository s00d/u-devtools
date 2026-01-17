/**
 * Console log entry type
 */
export interface ConsoleLog {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  args: unknown[];
  timestamp: number;
}

/**
 * Protocol definition for Console plugin
 */
export interface ConsoleProtocol {
  'console-log': (log: ConsoleLog) => void;
}

