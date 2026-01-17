/**
 * Server-side Storage
 * Manages user custom snippets in .u-devtools/library.json
 */

import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { FileSystemService } from '@u-devtools/utils-node';
import type { ComponentSnippet } from '../types';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const fs = new FileSystemService(ctx.root);
  const storagePath = '.u-devtools/library.json';

  const ensureStorage = async () => {
    const dir = '.u-devtools';
    if (!fs.exists(dir)) {
      await fs.mkdir(dir, true);
    }
    if (!fs.exists(storagePath)) {
      await fs.writeJson(storagePath, [], 2);
    }
  };

  rpc.handle('library:get-custom', async () => {
    try {
      await ensureStorage();
      if (!fs.exists(storagePath)) return [];
      const content = await fs.readJson<ComponentSnippet[]>(storagePath);
      return content || [];
    } catch (e: any) {
      console.error('[Library] Error loading custom snippets:', e.message);
      return [];
    }
  });

  rpc.handle('library:save', async (payload: unknown) => {
    try {
      const snippet = payload as ComponentSnippet;
      if (!snippet.id || !snippet.name || !snippet.html) {
        return { success: false, error: 'Missing required fields: id, name, html' };
      }

      await ensureStorage();
      const list = (await fs.readJson<ComponentSnippet[]>(storagePath)) || [];

      // Update or Add
      const idx = list.findIndex((s) => s.id === snippet.id);
      if (idx !== -1) {
        list[idx] = snippet;
      } else {
        list.push(snippet);
      }

      await fs.writeJson(storagePath, list, 2);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  });

  rpc.handle('library:delete', async (payload: unknown) => {
    try {
      const id = payload as string;
      if (!id) {
        return { success: false, error: 'Missing id' };
      }

      if (!fs.exists(storagePath)) {
        return { success: false, error: 'Storage file not found' };
      }

      const list = (await fs.readJson<ComponentSnippet[]>(storagePath)) || [];
      const newList = list.filter((s) => s.id !== id);
      await fs.writeJson(storagePath, newList, 2);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  });
}

