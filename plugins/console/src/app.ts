import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('console');

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface ConsoleLog {
  id: string;
  level: LogLevel;
  message: string;
  args: unknown[];
  timestamp: number;
}

function createLogHandler(level: LogLevel) {
  return (...args: unknown[]) => {
    const log: ConsoleLog = {
      id: Math.random().toString(36).slice(2),
      level,
      message: args.map((arg) => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }).join(' '),
      args,
      timestamp: Date.now(),
    };

    bridge.send('console-log', log);

    // Call original console method
    const original = console[level] as typeof console.log;
    original.apply(console, args);
  };
}

// Patch console methods
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;
const originalDebug = console.debug;

console.log = createLogHandler('log');
console.warn = createLogHandler('warn');
console.error = createLogHandler('error');
console.info = createLogHandler('info');
console.debug = createLogHandler('debug');

// Restore on unload (optional, for cleanup)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.info = originalInfo;
    console.debug = originalDebug;
  });
}

// --- CLEANUP (ВАЖНО!) ---
const hot = (import.meta as { hot?: { dispose: (fn: () => void) => void } }).hot;
if (hot) {
  hot.dispose(() => {
    // Восстанавливаем консоль
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.info = originalInfo;
    console.debug = originalDebug;
    
    bridge.close();
  });
}

