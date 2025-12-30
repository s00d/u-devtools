import { ref } from 'vue';
import type { DialogApi } from '@u-devtools/core';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (value: boolean) => void;
}

interface PromptOptions {
  title: string;
  message: string;
  defaultValue?: string;
  resolve: (value: string | null) => void;
}

// Глобальное состояние диалогов
export const dialogState = {
  confirm: ref<ConfirmOptions | null>(null),
  prompt: ref<PromptOptions | null>(null),
};

/**
 * Создает API для работы с диалогами.
 */
export function createDialogApi(): DialogApi {
  return {
    confirm(options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
    }): Promise<boolean> {
      return new Promise((resolve) => {
        dialogState.confirm.value = {
          ...options,
          resolve,
        };
      });
    },

    prompt(options: {
      title: string;
      message: string;
      defaultValue?: string;
    }): Promise<string | null> {
      return new Promise((resolve) => {
        dialogState.prompt.value = {
          ...options,
          resolve,
        };
      });
    },
  };
}
