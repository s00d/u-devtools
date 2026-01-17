import { z } from 'zod';

/**
 * Zod schema for RPC message validation.
 * Validates the structure of RPC messages used for communication between Server and Client contexts.
 */
export const RpcMessageSchema = z.object({
  /** Unique message identifier */
  id: z.string().min(1),
  /** Message type: 'request' for RPC calls, 'response' for replies, 'event' for broadcasts */
  type: z.enum(['request', 'response', 'event']),
  /** RPC method name (for requests and events) */
  method: z.string().optional(),
  /** Message payload data */
  payload: z.unknown().optional(),
  /** Error information (for error responses) */
  error: z.unknown().optional(),
});

/**
 * Type inferred from RpcMessageSchema
 */
export type RpcMessageType = z.infer<typeof RpcMessageSchema>;

/**
 * Validates an unknown value as an RPC message.
 * @param data - Data to validate
 * @returns Validated RPC message or null if validation fails
 */
export function validateRpcMessage(data: unknown): RpcMessageType | null {
  const result = RpcMessageSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}
