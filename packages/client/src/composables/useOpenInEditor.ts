import { computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { createSettingsApi } from '../modules/settings';

/**
 * Composable для открытия файлов в IDE
 * Использует глобальные настройки для выбора редактора
 */
export function useOpenInEditor(api: ClientApi) {
  const globalSettings = createSettingsApi('internal');

  // Получаем выбранный редактор из настроек
  const editor = computed(() => {
    return globalSettings.get<string>('launchEditor', 'code');
  });

  /**
   * Открыть файл в IDE
   * @param file Путь к файлу (относительно корня проекта)
   * @param line Номер строки (начинается с 1)
   * @param column Номер колонки (начинается с 1)
   */
  const openInEditor = async (file: string, line = 1, column = 1) => {
    try {
      await api.rpc.call('sys:openFile', {
        file,
        line,
        column,
        editor: editor.value,
      });
      api.notify(`Opening ${file} in ${editor.value}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      api.notify(`Failed to open file: ${message}`, 'error');
    }
  };

  return {
    openInEditor,
    editor,
  };
}
