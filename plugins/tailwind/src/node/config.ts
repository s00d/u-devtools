/**
 * Tailwind Config Reader
 * Reads and resolves Tailwind configuration from project
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { TailwindConfigSummary } from '../types';

export async function loadTailwindConfig(root: string): Promise<{
  success: boolean;
  config?: TailwindConfigSummary;
  error?: string;
}> {
  try {
    // 1. Find config file
    const possibleConfigs = [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.mjs',
      'tailwind.config.cjs',
    ];

    let configPath = '';
    for (const p of possibleConfigs) {
      const full = path.join(root, p);
      if (existsSync(full)) {
        configPath = full;
        break;
      }
    }

    if (!configPath) {
      return { success: false, error: 'Config not found' };
    }

    // 2. Try to resolve via tailwindcss (if installed in project)
    const resolveConfigPath = path.resolve(root, 'node_modules/tailwindcss/resolveConfig.js');

    if (!existsSync(resolveConfigPath)) {
      return { success: false, error: 'tailwindcss not found in node_modules' };
    }

    // Dynamic import of user config
    // Use timestamp to bust cache
    const userConfig = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);

    // Dynamic import of resolver
    const resolveConfigModule = await import(pathToFileURL(resolveConfigPath).href);
    const resolveConfig = resolveConfigModule.default || resolveConfigModule;

    const fullConfig = resolveConfig(userConfig.default || userConfig);

    // Return only what UI needs (to avoid sending megabytes)
    return {
      success: true,
      config: {
        theme: {
          colors: fullConfig.theme?.colors || {},
          spacing: fullConfig.theme?.spacing || {},
          screens: fullConfig.theme?.screens || {},
          fontFamily: fullConfig.theme?.fontFamily || {},
          fontSize: fullConfig.theme?.fontSize || {},
          borderRadius: fullConfig.theme?.borderRadius || {},
          boxShadow: fullConfig.theme?.boxShadow || {},
        },
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown error' };
  }
}

