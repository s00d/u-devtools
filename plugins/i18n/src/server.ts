import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { safeResolve } from '@u-devtools/utils-node';
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
  defaultLocale?: string;
}

interface FileData {
  content: unknown;
  locations: Record<string, { line: number; column: number }>;
}

export type TranslationContent = Record<string, unknown>;
export type LocaleData = Record<string, TranslationContent>;

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

async function readAllLocales(localesDir: string): Promise<LocaleData> {
  try {
    const files = await fs.readdir(localesDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const result: LocaleData = {};

    for (const file of jsonFiles) {
      const filePath = path.join(localesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      try {
        result[file] = JSON.parse(content) as TranslationContent;
      } catch {
        // Ignore invalid JSON files
      }
    }

    return result;
  } catch (e) {
    console.error('Failed to read locales', e);
    return {};
  }
}

export function setupServer(
  rpc: RpcServerInterface,
  ctx: ServerContext,
  options: I18nPluginOptions
) {
  const localesDir = path.resolve(ctx.root, options.dir);
  const defaultLocale = options.defaultLocale || 'en';

  // Get all locales and translations (returns LocaleData format)
  rpc.handle('i18n:getLocalesAndTranslations', async () => {
    return await readAllLocales(localesDir);
  });

  // Get configuration
  rpc.handle('i18n:getConfigs', async () => {
    return {
      defaultLocale,
      localesDir,
    };
  });

  // Save translation content to a file
  rpc.handle('i18n:saveTranslation', async (payload: unknown) => {
    const { filePath, content } = payload as {
      filePath: string;
      content: TranslationContent;
    };
    const file = safeResolve(localesDir, filePath);

    await fs.writeFile(file, JSON.stringify(content, null, 2), 'utf-8');

    // Broadcast update to all clients
    const updatedLocales = await readAllLocales(localesDir);
    rpc.broadcast('i18n:localesUpdate', updatedLocales);

    return true;
  });

  // Legacy methods for backward compatibility
  rpc.handle('i18n:getData', async () => {
    const locales = await readAllLocales(localesDir);
    const result: Record<string, FileData> = {};

    for (const [file, content] of Object.entries(locales)) {
      const filePath = path.join(localesDir, file);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const ast = jsonToAst(fileContent);
        const locations = collectLocations(ast);
        result[file] = {
          content,
          locations,
        };
      } catch {
        result[file] = {
          content,
          locations: {},
        };
      }
    }

    return result;
  });

  rpc.handle('i18n:save', async (payload: unknown) => {
    const { file, content } = payload as { file: string; content: unknown };
    const filePath = safeResolve(localesDir, file);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');

    // Broadcast update to all clients
    const updatedLocales = await readAllLocales(localesDir);
    rpc.broadcast('i18n:localesUpdate', updatedLocales);

    return true;
  });
}
