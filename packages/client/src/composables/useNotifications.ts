import { ref } from 'vue';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

const notifications = ref<Notification[]>([]);
let counter = 0;

export function useNotifications() {
  const notify = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
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
