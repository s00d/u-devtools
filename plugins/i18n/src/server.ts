import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { FileSystemService } from '@u-devtools/utils-node';
import * as path from 'node:path';
import jsonToAst from 'json-to-ast';
import { Translator } from './server/Translator';
import {
  SaveTranslationPayloadSchema,
  SavePayloadSchema,
  TranslatePayloadSchema,
} from './schemas';

// Используем типы из библиотеки json-to-ast
// Библиотека экспортирует типы через namespace parse
// Используем ReturnType для получения типа возвращаемого значения
type JsonToAstValueNode = ReturnType<typeof jsonToAst>;

// Определяем типы на основе структуры из библиотеки
interface IdentifierNode {
  type: 'Identifier';
  value: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

interface PropertyNode {
  type: 'Property';
  key: IdentifierNode;
  value: JsonToAstValueNode;
}

interface ObjectNode {
  type: 'Object';
  children: PropertyNode[];
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

type ValueNode = JsonToAstValueNode;

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
  ast: ValueNode,
  prefix = ''
): Record<string, { line: number; column: number }> {
  const locations: Record<string, { line: number; column: number }> = {};

  if (ast.type === 'Object') {
    const objectNode = ast as unknown as ObjectNode;
    if (objectNode.children) {
      for (const child of objectNode.children) {
        const propertyNode = child as unknown as PropertyNode;
        if (!propertyNode.key || !propertyNode.value) continue;
        // Проверяем наличие loc перед использованием
        if (!propertyNode.key.loc) continue;
        const key = propertyNode.key.value;
        const fullKey = prefix ? `${prefix}.${key}` : key;
        locations[fullKey] = {
          line: propertyNode.key.loc.start.line,
          column: propertyNode.key.loc.start.column,
        };

        if (propertyNode.value.type === 'Object') {
          Object.assign(locations, collectLocations(propertyNode.value, fullKey));
        }
      }
    }
  }

  return locations;
}

async function readAllLocales(localesDir: string, root: string, fs: FileSystemService): Promise<LocaleData> {
  const result: LocaleData = {};
  const relativeLocalesDir = path.relative(root, localesDir);

  async function readDirectory(dirRelativePath: string, keyPrefix = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dirRelativePath, { withFileTypes: true }) as Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;

      for (const entry of entries) {
        const entryRelativePath = path.join(dirRelativePath, entry.name);
        const entryKey = keyPrefix ? `${keyPrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          // Рекурсивно читаем подпапки
          await readDirectory(entryRelativePath, entryKey);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          // Читаем JSON файл
          try {
            const parsed = await fs.readJson<TranslationContent>(entryRelativePath);
            if (parsed) {
              // Используем относительный путь как ключ
              result[entryKey] = parsed;
            }
          } catch {
            // Ignore invalid JSON files
          }
        }
      }
    } catch (e) {
      console.error(`Failed to read directory ${dirRelativePath}:`, e);
    }
  }

  try {
    await readDirectory(relativeLocalesDir);
  return result;
  } catch (e) {
    console.error('Failed to read locales', e);
    return {};
  }
}

import { getI18nOptions } from './index.js';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const options = getI18nOptions();
  if (!options) {
    console.error(
      '[i18n] Plugin options not found. Make sure i18nPlugin() is called with options.'
    );
    return;
  }

  const localesDir = path.resolve(ctx.root, options.dir);
  const defaultLocale = options.defaultLocale || 'en';
  const fs = new FileSystemService(ctx.root);

  // Get all locales and translations (returns LocaleData format)
  rpc.handle('i18n:getLocalesAndTranslations', async () => {
    return await readAllLocales(localesDir, ctx.root, fs);
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
    const validationResult = SaveTranslationPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    const { filePath, content } = validationResult.data;
    const relativeFilePath = path.relative(ctx.root, path.resolve(localesDir, filePath));

    // Создаем директории, если их нет
    const dir = path.dirname(relativeFilePath);
    if (dir !== '.') {
      await fs.mkdir(dir, true);
    }

    await fs.writeJson(relativeFilePath, content, 2);

    // Broadcast update to all clients
    const updatedLocales = await readAllLocales(localesDir, ctx.root, fs);
    rpc.broadcast('i18n:localesUpdate', updatedLocales);

    return true;
  });

  // Legacy methods for backward compatibility
  rpc.handle('i18n:getData', async () => {
    const locales = await readAllLocales(localesDir, ctx.root, fs);
    const result: Record<string, FileData> = {};

    for (const [file, content] of Object.entries(locales)) {
      // file уже содержит относительный путь (например, "pages/articles-id/en.json")
      const relativeFilePath = path.relative(ctx.root, path.resolve(localesDir, file));
      try {
        const fileContent = await fs.read(relativeFilePath);
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
    const validationResult = SavePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    const { file, content } = validationResult.data;
    const relativeFilePath = path.relative(ctx.root, path.resolve(localesDir, file));
    
    // Создаем директории, если их нет
    const dir = path.dirname(relativeFilePath);
    if (dir !== '.') {
      await fs.mkdir(dir, true);
    }
    
    await fs.writeJson(relativeFilePath, content, 2);

    // Broadcast update to all clients
    const updatedLocales = await readAllLocales(localesDir, ctx.root, fs);
    rpc.broadcast('i18n:localesUpdate', updatedLocales);

    return true;
  });

  // Translation RPC method (server-side for security)
  rpc.handle('i18n:translate', async (payload: unknown) => {
    const validationResult = TranslatePayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    const { text, fromLang, toLang, driver, apiKey, options } = validationResult.data;

    if (driver === 'disabled') {
      throw new Error('Translation service is not configured');
    }

    try {
      const translator = new Translator({
        apiKey,
        driver,
        options: options ? (options as { [key: string]: string | number | boolean }) : {},
      });

      const translated = await translator.translate(text, fromLang, toLang);
      return translated;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      throw new Error(`Translation error: ${error}`);
    }
  });
}
