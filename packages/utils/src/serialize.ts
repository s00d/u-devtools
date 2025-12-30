/**
 * Serializes data by removing functions and circular references.
 * Useful for sending complex objects through BroadcastChannel or JSON.
 * 
 * @param data - Data to serialize
 * @returns Serialized data with functions removed and circular references replaced with '[Circular]'
 */
export function serialize<T>(data: T): T {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: unknown): unknown => {
    // Remove functions
    if (typeof value === 'function') {
      return undefined;
    }
    // Remove native code objects (like String constructor)
    if (value && typeof value === 'object') {
      const proto = Object.getPrototypeOf(value);
      if (proto && proto.constructor && proto.constructor.name === 'String') {
        return String(value);
      }
      // Handle circular references
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
  
  try {
    const result = JSON.parse(JSON.stringify(data, replacer)) as T;
    return result;
  } catch (e) {
    console.warn(`[Utils] Serialization error: ${e instanceof Error ? e.message : String(e)}`);
    // Return empty object/array/null as fallback
    if (Array.isArray(data)) {
      return [] as T;
    }
    if (data && typeof data === 'object') {
      return {} as T;
    }
    return null as T;
  }
}

