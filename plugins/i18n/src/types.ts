export type JSONValue = string | null | number | boolean | { [key: string]: JSONValue };

export interface TranslationContent {
  [key: string]: JSONValue;
}

export type LocaleData = Record<string, TranslationContent>;

export interface ModuleOptions {
  defaultLocale?: string;
  localesDir?: string;
}

export interface TreeNode {
  name: string;
  fullPath: string;
  isFile: boolean;
  children: TreeNode[];
}

