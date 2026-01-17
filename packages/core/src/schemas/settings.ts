import { z } from 'zod';

/**
 * Zod schema for setting type validation.
 */
export const SettingTypeSchema = z.enum(['string', 'number', 'boolean', 'select', 'array']);

/**
 * Zod schema for setting option (used in select type).
 */
export const SettingOptionSchema = z.object({
  label: z.string(),
  value: z.unknown(),
});

/**
 * Zod schema for setting schema definition.
 * Recursive schema using z.lazy for items field.
 */
export const SettingSchemaDefSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    /** Display label for the setting */
    label: z.string().min(1),
    /** Optional description/tooltip text */
    description: z.string().optional(),
    /** Setting type (determines input component) */
    type: SettingTypeSchema,
    /** Default value */
    default: z.unknown().optional(),
    /** Options for 'select' type settings */
    options: z.array(SettingOptionSchema).optional(),
    /** Schema for array items (for 'array' type with object items) */
    items: z.record(z.string(), SettingSchemaDefSchema).optional(),
    /** Item type for 'array' type with primitive items ('string' or 'number') */
    itemType: z.enum(['string', 'number']).optional(),
  })
);

/**
 * Zod schema for plugin settings schema (record of setting definitions).
 */
export const PluginSettingsSchemaSchema = z.record(z.string(), SettingSchemaDefSchema);

/**
 * Type inferred from SettingSchemaDefSchema
 */
export type SettingSchemaDefType = z.infer<typeof SettingSchemaDefSchema>;

/**
 * Type inferred from PluginSettingsSchemaSchema
 */
export type PluginSettingsSchemaType = z.infer<typeof PluginSettingsSchemaSchema>;

/**
 * Validates a setting schema definition.
 * @param data - Data to validate
 * @returns Validated setting schema definition or null if validation fails
 */
export function validateSettingSchemaDef(data: unknown): SettingSchemaDefType | null {
  const result = SettingSchemaDefSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

/**
 * Validates a plugin settings schema.
 * @param data - Data to validate
 * @returns Validated plugin settings schema or null if validation fails
 */
export function validatePluginSettingsSchema(data: unknown): PluginSettingsSchemaType | null {
  const result = PluginSettingsSchemaSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

/**
 * Validates a setting value against its schema definition.
 * @param value - Value to validate
 * @param schemaDef - Setting schema definition
 * @returns True if value is valid, false otherwise
 */
export function validateSettingValue(value: unknown, schemaDef: SettingSchemaDefType): boolean {
  switch (schemaDef.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'select':
      if (!schemaDef.options) return false;
      return schemaDef.options.some((opt: { label: string; value: unknown }) => opt.value === value);
    case 'array':
      if (!Array.isArray(value)) return false;
      if (schemaDef.itemType) {
        // Primitive array items
        return value.every((item) => {
          if (schemaDef.itemType === 'string') return typeof item === 'string';
          if (schemaDef.itemType === 'number') return typeof item === 'number';
          return false;
        });
      }
      if (schemaDef.items) {
        // Object array items - validate each item
        const itemsSchema = schemaDef.items;
        return value.every((item) => {
          if (typeof item !== 'object' || item === null) return false;
          for (const [key, itemSchema] of Object.entries(itemsSchema)) {
            const itemValue = (item as Record<string, unknown>)[key];
            if (!validateSettingValue(itemValue, itemSchema)) {
              return false;
            }
          }
          return true;
        });
      }
      return true; // Array without constraints
    default:
      return false;
  }
}
