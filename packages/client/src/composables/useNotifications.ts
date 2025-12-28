import { ref } from 'vue';
import { createSettingsApi } from '../modules/settings';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

const notifications = ref<Notification[]>([]);
let counter = 0;

export function useNotifications() {
  const notify = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    // Проверяем настройку notifications
    const generalApi = createSettingsApi('general');
    if (generalApi.get('notifications') === false) {
      return;
    }
    
    const id = counter++;
    notifications.value.push({ id, message, type });

    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id);
    }, 3000);
  };

  return {
    notifications,
    notify,
  };
}
