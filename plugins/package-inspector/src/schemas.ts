import { z } from 'zod';

/**
 * Zod schema for pkg:check-latest payload
 */
export const CheckLatestPayloadSchema = z.array(z.string().min(1));

/**
 * Zod schema for pkg:execute payload
 */
export const ExecutePayloadSchema = z.object({
  cmd: z.enum(['install', 'uninstall', 'update']),
  pkgs: z.array(z.string().min(1)).min(1, 'pkgs must be a non-empty array'),
  dev: z.boolean().optional(),
});
