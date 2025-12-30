import type { ClipboardApi } from '@u-devtools/core';

/**
 * Создает API для работы с буфером обмена.
 */
export function createClipboardApi(
  notify: (msg: string, type?: 'info' | 'error' | 'success') => void
): ClipboardApi {
  return {
    async copy(text: string, successMessage = 'Copied to clipboard!') {
      try {
        await navigator.clipboard.writeText(text);
        notify(successMessage, 'success');
      } catch (e) {
        console.error('Failed to copy to clipboard', e);
        notify('Failed to copy', 'error');
      }
    },

    async read(): Promise<string> {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {
        console.error('Failed to read clipboard', e);
        notify('Failed to read clipboard', 'error');
        return '';
      }
    },
  };
}
