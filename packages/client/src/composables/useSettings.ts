import { reactive, watch } from 'vue';

const settingsState = reactive<Record<string, unknown>>({});

try {
  const saved = localStorage.getItem('u-devtools-settings');
  if (saved) {
    Object.assign(settingsState, JSON.parse(saved));
  }
} catch (e) {
  // Ignore
}

watch(
  settingsState,
  () => {
    localStorage.setItem('u-devtools-settings', JSON.stringify(settingsState));
  },
  { deep: true }
);

export function useSettings() {
  const getSetting = (plugin: string, key: string, def: unknown) => {
    return settingsState[`${plugin}:${key}`] ?? def;
  };

  const saveSetting = (plugin: string, key: string, val: unknown) => {
    settingsState[`${plugin}:${key}`] = val;
  };

  return { getSetting, saveSetting, settingsState };
}
