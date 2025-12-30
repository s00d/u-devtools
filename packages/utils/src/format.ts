/**
 * Formats a timestamp to a readable time string with milliseconds.
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'ru-RU')
 * @returns Formatted time string (e.g., "14:30:45.123")
 */
export function formatTime(timestamp: number, locale = 'ru-RU'): string {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${time}.${ms}`;
}

/**
 * Formats a timestamp to a readable date and time string.
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'ru-RU')
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number, locale = 'ru-RU'): string {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formats a duration in milliseconds to a readable string.
 * 
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "1.5s", "250ms")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

