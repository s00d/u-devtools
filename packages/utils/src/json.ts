/**
 * Safely parses a JSON string with error handling.
 * 
 * @param text - JSON string to parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function safeJsonParse<T = unknown>(text: string, defaultValue: T | null = null): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely stringifies an object with error handling.
 * 
 * @param value - Value to stringify
 * @param defaultValue - Default string to return if stringification fails
 * @returns JSON string or default value
 */
export function safeJsonStringify(value: unknown, defaultValue = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely parses a JSON string from localStorage.
 * 
 * @param key - localStorage key
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns Parsed object or default value
 */
export function safeLocalStorageGet<T = unknown>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely sets a value in localStorage as JSON.
 * 
 * @param key - localStorage key
 * @param value - Value to store
 * @returns true if successful, false otherwise
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

