import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type Group, type ParticipantsListItem } from '@src/types';
import { useShallow } from 'zustand/react/shallow';
import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';

type ParticipantsState = {
  urlStores: Record<
    string,
    {
      participants: ParticipantsListItem[];
      selectAllChecked: boolean;
      groupsOrder: Group[];
    }
  >;
  setParticipants: (url: string, participants: ParticipantsListItem[], observer?: boolean) => void;
  setGroupsOrder: (url: string, groups: Group[]) => void;
  setSelectAllStatus: (url: string, selectAllChecked: boolean) => void;
  cleanStorage: (url: string) => void;
};

export const useParticipantsStore = create(
  persist<ParticipantsState>(
    set => ({
      urlStores: {},
      setParticipants: (url, participants) =>
        set(state => {
          const urlStore = state.urlStores[url];
          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participants,
              },
            },
          };
        }),
      setGroupsOrder: (url, groups) => {
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                groupsOrder: groups,
              },
            },
          };
        });
      },
      setSelectAllStatus: (url, selectAllChecked) => {
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;
          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                selectAllChecked: selectAllChecked,
              },
            },
          };
        });
      },
      cleanStorage: url => {
        set(state => {
          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                participants: [],
                selectAllChecked: false,
              },
            },
          };
        });
      },
    }),
    {
      name: 'participants-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);

// Helper hook to access URL-specific store
export const useUrlParticipants = (url: string) => {
  const storeUrl = url || 'default';
  const participants = useParticipantsStore(useShallow(state => state.urlStores[storeUrl]?.participants || []));
  const groups = useParticipantsStore(useShallow(state => state.urlStores[storeUrl]?.groupsOrder || []));
  const isSelectAllChecked = useParticipantsStore(state => state.urlStores[storeUrl]?.selectAllChecked || false);
  const setParticipants = useParticipantsStore(state => state.setParticipants);
  const setSelectAllStatus = useParticipantsStore(state => state.setSelectAllStatus);
  const cleanStorage = useParticipantsStore(state => state.cleanStorage);
  const setGroupsOrder = useParticipantsStore(state => state.setGroupsOrder);

  return {
    participants,
    groups,
    isSelectAllChecked,
    cleanStorage: () => cleanStorage(storeUrl),
    setParticipants: (participants: ParticipantsListItem[], observer?: boolean) => {
      return setParticipants(storeUrl, participants, observer);
    },
    setGroupsOrder: (group: Group[]) => setGroupsOrder(storeUrl, group),
    setSelectAllStatus: (checked: boolean) => setSelectAllStatus(storeUrl, checked),
  };
};
