import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SELECTORS, type ChatSendButton, type Selectors } from '@extension/shared';
import { chromeStorage } from './chromeStorage';

interface SelectorsState {
  selectors: Selectors;
  updateSelector: (key: keyof Selectors, value: string | ChatSendButton) => void;
  resetSelectors: () => void;
  _hasHydrated: boolean;
}

export const useSelectorsStore = create(
  persist<SelectorsState>(
    set => ({
      selectors: DEFAULT_SELECTORS,
      updateSelector: (key, value) =>
        set(state => ({
          selectors: { ...state.selectors, [key]: value },
        })),
      resetSelectors: () => set({ selectors: DEFAULT_SELECTORS }),
      _hasHydrated: false,
    }),
    {
      name: 'MEET_SELECTORS',
      storage: createJSONStorage(() => chromeStorage),
      onRehydrateStorage: () => () => {
        useSelectorsStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
