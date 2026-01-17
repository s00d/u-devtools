/**
 * Server-side RPC Handlers
 * Sets up RPC endpoints for Tailwind Commander
 */

import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import path from 'node:path';
import { z } from 'zod';
import { loadTailwindConfig } from './node/config';
import { updateClassesInFile } from './node/patcher';

/**
 * Zod schema for tailwind:update-file payload validation
 */
const UpdateFilePayloadSchema = z.object({
  filePath: z.string().min(1, 'filePath is required'),
  line: z.number().int().positive('line must be a positive integer'),
  tagName: z.string().min(1, 'tagName is required'),
  newClasses: z.array(z.string()).min(1, 'newClasses must be a non-empty array'),
  attributeName: z.string().optional(),
  newTextContent: z.string().optional(),
});

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // Get Tailwind config
  rpc.handle('tailwind:get-config', async () => {
    return await loadTailwindConfig(ctx.root);
  });

  // Save changes to source file (Source Code Sync)
  rpc.handle('tailwind:update-file', async (payload: unknown) => {
    console.log('[Tailwind Server] tailwind:update-file called with payload:', JSON.stringify(payload, null, 2));
    
    try {
      // Validate payload using Zod schema
      const validationResult = UpdateFilePayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.error('[Tailwind Server] Validation failed:', errors);
        return {
          success: false,
          error: `Validation failed: ${errors}`,
        };
      }

      const options = validationResult.data;

      console.log('[Tailwind Server] Parsed options:', {
        filePath: options.filePath,
        line: options.line,
        tagName: options.tagName,
        newClasses: options.newClasses,
        attributeName: options.attributeName,
        newTextContent: options.newTextContent,
      });

      // Security check: ensure path is inside project root
      const absolutePath = path.isAbsolute(options.filePath)
        ? options.filePath
        : path.resolve(ctx.root, options.filePath);

      console.log('[Tailwind Server] Path resolution:', {
        original: options.filePath,
        absolute: absolutePath,
        root: ctx.root,
      });

      // Normalize paths for comparison
      const normalizedAbsolute = path.normalize(absolutePath);
      const normalizedRoot = path.normalize(ctx.root);

      if (!normalizedAbsolute.startsWith(normalizedRoot)) {
        console.error('[Tailwind Server] Security check failed: File outside project root', {
          normalizedAbsolute,
          normalizedRoot,
        });
        return {
          success: false,
          error: 'Access denied: File outside project root',
        };
      }

      console.log('[Tailwind Server] Calling updateClassesInFile...');
      const result = await updateClassesInFile(
        absolutePath,
        options.line,
        options.tagName,
        options.newClasses,
        options.newTextContent
      );

      console.log('[Tailwind Server] updateClassesInFile result:', result);
      return result;
    } catch (e: any) {
      console.error('[Tailwind Server] Error in tailwind:update-file:', e);
      return { success: false, error: e.message || 'Unknown error' };
    }
  });
}

