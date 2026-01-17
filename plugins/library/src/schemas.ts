import { z } from 'zod';

/**
 * Zod schema for ComponentSnippet
 */
export const ComponentSnippetSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().min(1, 'name is required'),
  category: z.string().optional(),
  html: z.string().min(1, 'html is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isCustom: z.boolean().optional(),
});

/**
 * Zod schema for library:save payload
 */
export const LibrarySavePayloadSchema = ComponentSnippetSchema;

/**
 * Zod schema for library:delete payload
 */
export const LibraryDeletePayloadSchema = z.string().min(1, 'id is required');
