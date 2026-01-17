/**
 * Server-side Storage
 * Manages user custom snippets in .u-devtools/library.json
 */

import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import type { ComponentSnippet } from './types';
import { LibrarySavePayloadSchema, LibraryDeletePayloadSchema } from './schemas';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const storagePath = path.join(ctx.root, '.u-devtools', 'library.json');

  const ensureStorage = async () => {
    const dir = path.dirname(storagePath);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    if (!existsSync(storagePath)) {
      await fs.writeFile(storagePath, JSON.stringify([], null, 2), 'utf-8');
    }
  };

  rpc.handle('library:get-custom', async () => {
    try {
      await ensureStorage();
      if (!existsSync(storagePath)) return [];
      const content = await fs.readFile(storagePath, 'utf-8');
      return JSON.parse(content) as ComponentSnippet[];
    } catch (e: any) {
      console.error('[Library] Error loading custom snippets:', e.message);
      return [];
    }
  });

  rpc.handle('library:save', async (payload: unknown) => {
    try {
      const validationResult = LibrarySavePayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errors}` };
      }
      const snippet = validationResult.data;

      await ensureStorage();
      const content = await fs.readFile(storagePath, 'utf-8');
      const list = JSON.parse(content) as ComponentSnippet[];

      // Update or Add
      const idx = list.findIndex((s) => s.id === snippet.id);
      if (idx !== -1) {
        list[idx] = snippet;
      } else {
        list.push(snippet);
      }

      await fs.writeFile(storagePath, JSON.stringify(list, null, 2), 'utf-8');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  });

  rpc.handle('library:delete', async (payload: unknown) => {
    try {
      const validationResult = LibraryDeletePayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((e) => e.message).join(', ');
        return { success: false, error: `Validation failed: ${errors}` };
      }
      const id = validationResult.data;

      if (!existsSync(storagePath)) {
        return { success: false, error: 'Storage file not found' };
      }

      const content = await fs.readFile(storagePath, 'utf-8');
      const list = JSON.parse(content) as ComponentSnippet[];
      const newList = list.filter((s) => s.id !== id);
      await fs.writeFile(storagePath, JSON.stringify(newList, null, 2), 'utf-8');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  });
}

