import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { ConsoleProtocol, ConsoleLog } from './types';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

// Save original functions BEFORE overriding
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;
const originalDebug = console.debug;

// Mapping of original functions
const originals: Record<LogLevel, typeof console.log> = {
  log: originalLog,
  warn: originalWarn,
  error: originalError,
  info: originalInfo,
  debug: originalDebug,
};

function createLogHandler(level: LogLevel, bridge: AppBridge<ConsoleProtocol>) {
  return (...args: unknown[]) => {
    const log: ConsoleLog = {
      id: Math.random().toString(36).slice(2),
      level,
      message: args
        .map((arg) => {
          if (typeof arg === 'string') return arg;
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        })
        .join(' '),
      args,
      timestamp: Date.now(),
    };

    bridge.send('console-log', log);

    // Call original function from saved mapping
    const original = originals[level];
    original.apply(console, args);
  };
}

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

export default defineApp({
  component: undefined,
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<ConsoleProtocol>;
    setupDevTools({ bridge: typedBridge });
    // Перехватываем console методы после установки bridge
    console.log = createLogHandler('log', typedBridge);
    console.warn = createLogHandler('warn', typedBridge);
    console.error = createLogHandler('error', typedBridge);
    console.info = createLogHandler('info', typedBridge);
    console.debug = createLogHandler('debug', typedBridge);

    // Очистка при удалении плагина
    onCleanup(() => {
      // Restore console
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
      console.debug = originalDebug;
    });
  },
});
