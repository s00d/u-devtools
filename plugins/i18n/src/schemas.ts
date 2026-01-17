import { z } from 'zod';

/**
 * Zod schema for TranslationContent (Record<string, JSONValue>)
 */
export const TranslationContentSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.record(z.string(), z.unknown())])
);

/**
 * Zod schema for i18n:saveTranslation payload
 */
export const SaveTranslationPayloadSchema = z.object({
  filePath: z.string().min(1, 'filePath is required'),
  content: TranslationContentSchema,
});

/**
 * Zod schema for i18n:save payload
 */
export const SavePayloadSchema = z.object({
  file: z.string().min(1, 'file is required'),
  content: z.unknown(),
});

/**
 * Zod schema for i18n:translate payload
 */
export const TranslatePayloadSchema = z.object({
  text: z.string().min(1, 'text is required'),
  fromLang: z.string().min(1, 'fromLang is required'),
  toLang: z.string().min(1, 'toLang is required'),
  driver: z.enum(['google', 'yandex', 'deepl', 'openai', 'deepseek', 'google-free', 'yandex-cloud', 'disabled']),
  apiKey: z.string().min(1, 'apiKey is required'),
  options: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
