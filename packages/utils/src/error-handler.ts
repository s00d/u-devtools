import { z } from 'zod';

/**
 * Zod schema for error-like objects
 */
const ErrorLikeSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
  name: z.string().optional(),
}).passthrough();

/**
 * Extracts error message from unknown error value.
 * Handles Error instances, error-like objects, and primitive values.
 * 
 * @param error - Error value of unknown type
 * @returns Extracted error message as string
 * 
 * @example
 * ```ts
 * try {
 *   // some code
 * } catch (e) {
 *   const message = extractErrorMessage(e);
 *   console.error(message);
 * }
 * ```
 */
export function extractErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle error-like objects using Zod validation
  if (error && typeof error === 'object') {
    const result = ErrorLikeSchema.safeParse(error);
    if (result.success) {
      const errorObj = result.data;
      if (errorObj.message) {
        return String(errorObj.message);
      }
      if (errorObj.error) {
        return String(errorObj.error);
      }
    }
  }

  // Handle primitive values
  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  return String(error);
}
