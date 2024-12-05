import chromeStorage from '@src/utils/chromeStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsState = {
  isLightTheme: string;
  isDarkTheme: string;
  setTheme: (theme: 'dark' | 'light') => void;
};

export const useSettingsStore = create(
  persist<SettingsState>(
    set => ({
      isLightTheme: '',
      isDarkTheme: '',
      setTheme: theme =>
        set(() => {
          theme === 'light' ? 'dark' : 'light';
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);
