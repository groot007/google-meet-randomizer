import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UIState = {
  theme: 'dark' | 'light';
  isLightTheme: boolean;
  isDarkTheme: boolean;
  isSelectedByUser: boolean;
  setTheme: (theme: 'dark' | 'light', setByUser?: boolean) => void;
};

export const useUIStore = create(
  persist<UIState>(
    set => ({
      theme: 'light',
      isLightTheme: true,
      isDarkTheme: false,
      isSelectedByUser: false,
      setTheme: (theme, setByUser) =>
        set(() => ({
          isSelectedByUser: setByUser,
          theme: theme,
          isLightTheme: theme === 'light',
          isDarkTheme: theme === 'dark',
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);
