/**
 * Utility for generating cURL command from request object
 */

interface RequestData {
  url: string;
  method: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
}

/**
 * Escapes string for use in shell command
 */
function escapeShell(str: string): string {
  // Escape single quotes and special characters
  return str.replace(/'/g, "'\\''");
}

/**
 * Formats request body for cURL
 */
function formatBody(body: unknown): string | null {
  if (body === null || body === undefined) {
    return null;
  }

  if (typeof body === 'string') {
    // If already string, check if it's JSON
    try {
      JSON.parse(body);
      return body;
    } catch {
      return body;
    }
  }

  if (typeof body === 'object') {
    // Serialize object to JSON
    return JSON.stringify(body, null, 2);
  }

  return String(body);
}

/**
 * Generates cURL command from request object
 */
export function generateCurlCommand(request: RequestData): string {
  const parts: string[] = ['curl'];

  // URL (required)
  parts.push(`'${escapeShell(request.url)}'`);

  // Method (if not GET)
  if (request.method.toUpperCase() !== 'GET') {
    parts.push(`-X ${request.method.toUpperCase()}`);
  }

  // Headers
  if (request.requestHeaders) {
    for (const [key, value] of Object.entries(request.requestHeaders)) {
      // Skip some headers that are added automatically by browser
      const skipHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];
      if (skipHeaders.includes(key.toLowerCase())) {
        continue;
      }
      parts.push(`-H '${escapeShell(`${key}: ${value}`)}'`);
    }
  }

  // Body
  const body = formatBody(request.requestBody);
  if (body !== null) {
    // Determine Content-Type from headers
    const contentType =
      request.requestHeaders?.['Content-Type'] ||
      request.requestHeaders?.['content-type'] ||
      'application/json';

    // If JSON, use --data-raw, otherwise --data
    if (contentType.includes('application/json')) {
      parts.push(`--data-raw '${escapeShell(body)}'`);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      parts.push(`--data-raw '${escapeShell(body)}'`);
    } else {
      parts.push(`--data-raw '${escapeShell(body)}'`);
    }
  }

  return parts.join(' \\\n  ');
}
