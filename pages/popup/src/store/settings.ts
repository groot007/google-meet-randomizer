import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsState = {
  listPrefix: string;
  listPostfix: string;
  listItemMarker: string;
  setListPrefix: (listPrefix: string) => void;
  setListPostfix: (listPostfix: string) => void;
  setListItemMarker: (listItemMarker: string) => void;
};

export const useSettingsStore = create(
  persist<SettingsState>(
    set => ({
      listPrefix: '',
      listPostfix: '',
      listItemMarker: '',
      setListPrefix: listPrefix => set({ listPrefix }),
      setListPostfix: listPostfix => set({ listPostfix }),
      setListItemMarker: listItemMarker => set({ listItemMarker }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);
