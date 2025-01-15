import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsState = {
  listPrefix: string;
  listPostfix: string;
  listItemMarker: string;
  isDrawingFeatureActive: boolean;
  isPencilActive: boolean;
  setListPrefix: (listPrefix: string) => void;
  setListPostfix: (listPostfix: string) => void;
  setListItemMarker: (listItemMarker: string) => void;
  setIsDrawingFeatureActive: (isDrawingFeatureActive: boolean) => void;
  setIsPencilActive: (isPencilActive: boolean) => void;
};

export const useSettingsStore = create(
  persist<SettingsState>(
    set => ({
      listPrefix: '',
      listPostfix: '',
      listItemMarker: '#.',
      isDrawingFeatureActive: false,
      isPencilActive: false,
      setIsDrawingFeatureActive: isDrawingFeatureActive => set({ isDrawingFeatureActive }),
      setIsPencilActive: isPencilActive => set({ isPencilActive }),
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
