/**
 * Color utility type for status badges
 */
export type StatusColor = 'gray' | 'green' | 'blue' | 'yellow' | 'red';

/**
 * Gets a color based on HTTP status code.
 * 
 * @param status - HTTP status code
 * @returns Color name for the status
 */
export function getStatusColor(status?: number): StatusColor {
  if (!status) return 'gray';
  if (status >= 200 && status < 300) return 'green';
  if (status >= 300 && status < 400) return 'blue';
  if (status >= 400 && status < 500) return 'yellow';
  return 'red';
}

/**
 * Gets a color based on console log level.
 * 
 * @param level - Console log level
 * @returns Color name for the level
 */
export function getLevelColor(level: string): StatusColor {
  switch (level) {
    case 'error':
      return 'red';
    case 'warn':
      return 'yellow';
    case 'info':
      return 'blue';
    case 'debug':
      return 'gray';
    default:
      return 'gray';
  }
}

