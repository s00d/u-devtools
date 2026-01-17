import { z } from 'zod';

/**
 * Zod schema for manager:search payload
 */
export const ManagerSearchPayloadSchema = z.string().optional().default('keywords:u-devtools-plugin');

/**
 * Zod schema for manager:install payload
 */
export const ManagerInstallPayloadSchema = z.string().min(1, 'pkgName is required');

/**
 * Zod schema for manager:uninstall payload
 */
export const ManagerUninstallPayloadSchema = z.string().min(1, 'pkgName is required');

/**
 * Zod schema for manager:checkUpdates payload
 */
export const ManagerCheckUpdatesPayloadSchema = z.array(z.string().min(1));

/**
 * Zod schema for manager:getNpmInfo payload
 */
export const ManagerGetNpmInfoPayloadSchema = z.string().min(1, 'pkgName is required');
