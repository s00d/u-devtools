import { z } from 'zod';

/**
 * Zod schema for componentsbook handlers payload (all use { path: string })
 */
export const ComponentsbookPathPayloadSchema = z.object({
  path: z.string().min(1, 'path is required'),
});
