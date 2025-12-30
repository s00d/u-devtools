import type { Plugin } from 'vite';
import { readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Плагин для очистки временных timestamp файлов, создаваемых Vite
 */
export function cleanTimestampFiles(dir: string): Plugin {
  return {
    name: 'clean-timestamp-files',
    buildStart() {
      try {
        const files = readdirSync(dir);
        files.forEach((file) => {
          if (file.includes('.timestamp-') && file.endsWith('.mjs')) {
            try {
              unlinkSync(join(dir, file));
            } catch (_e) {
              // Игнорируем ошибки удаления
            }
          }
        });
      } catch (_e) {
        // Игнорируем ошибки чтения директории
      }
    },
  };
}
