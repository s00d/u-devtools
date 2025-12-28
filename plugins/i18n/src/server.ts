import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { safeResolve } from '@u-devtools/core';
import fs from 'node:fs/promises';
import * as path from 'node:path';
import jsonToAst from 'json-to-ast';

interface ASTNode {
  type: 'Object' | 'Array' | 'Literal' | 'Property';
  loc: { start: { line: number; column: number }; end: { line: number; column: number } };
  children?: ASTNode[];
  key?: ASTNode & { value: string };
  value?: ASTNode;
}

export interface I18nPluginOptions {
  dir: string;
}

interface FileData {
  content: unknown;
  locations: Record<string, { line: number; column: number }>;
}

function collectLocations(
  ast: ASTNode,
  prefix = ''
): Record<string, { line: number; column: number }> {
  const locations: Record<string, { line: number; column: number }> = {};

  if (ast.type === 'Object' && ast.children) {
    for (const child of ast.children) {
      if (!child.key || !child.value) continue;
      const key = child.key.value;
      const fullKey = prefix ? `${prefix}.${key}` : key;
      locations[fullKey] = {
        line: child.key.loc.start.line,
        column: child.key.loc.start.column,
      };

      if (child.value.type === 'Object') {
        Object.assign(locations, collectLocations(child.value, fullKey));
      }
    }
  }

  return locations;
}

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options: I18nPluginOptions
) {
  const localesDir = path.resolve(ctx.root, options.dir);

  rpc.handle('i18n:getData', async () => {
    try {
      const files = await fs.readdir(localesDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const result: Record<string, FileData> = {};

      for (const file of jsonFiles) {
        const filePath = path.join(localesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        try {
          const ast = jsonToAst(content);
          const locations = collectLocations(ast);
          result[file] = {
            content: JSON.parse(content),
            locations,
          };
        } catch {
          result[file] = {
            content: JSON.parse(content),
            locations: {},
          };
        }
      }

      return result;
    } catch (e) {
      console.error('Failed to read locales', e);
      return {};
    }
  });

  rpc.handle('i18n:save', async (payload: unknown) => {
    const { file, content } = payload as { file: string; content: unknown };
    const filePath = safeResolve(localesDir, file);

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  });
}
