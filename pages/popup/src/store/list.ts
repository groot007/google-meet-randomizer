import chromeStorage from '@src/utils/chromeStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getUniqueParticipants, sortByStatus } from '../utils';
import { type ParticipantsListItem } from '@src/types';
import { useShallow } from 'zustand/react/shallow';

type ParticipantsState = {
  urlStores: Record<
    string,
    {
      participants: ParticipantsListItem[];
      selectAllChecked: boolean;
    }
  >;
  setParticipants: (url: string, participants: ParticipantsListItem[]) => void;
  deleteParticipant: (url: string, id: string) => void;
  toggleInclude: (url: string, id: string) => void;
  togglePinTop: (url: string, id: string) => void;
  togglePinBottom: (url: string, id: string) => void;
  toggleSelectAll: (url: string) => void;
  setSelectAllChecked: (url: string, selectAllChecked: boolean) => void;
};

export const useParticipantsStore = create(
  persist<ParticipantsState>(
    set => ({
      urlStores: {},
      setParticipants: (url, participants) =>
        set(state => {
          const existingParticipants = state.urlStores[url]?.participants || [];
          const uniqueParticipants = getUniqueParticipants(participants);

          // Handle manually added participants
          const manuallyAddedParticipants = uniqueParticipants.map(newParticipant => {
            const existingParticipant = existingParticipants.find(p => p.name === newParticipant.name);
            if (newParticipant.isAddedManually) {
              return existingParticipant ? { ...existingParticipant, isVisible: true } : newParticipant;
            }
            return newParticipant;
          });

          // Handle non-manually added participants
          const nonManuallyAddedParticipants = existingParticipants.map(existingParticipant => {
            const newParticipant = uniqueParticipants.find(
              p => p.name === existingParticipant.name && !p.isAddedManually,
            );

            if (!newParticipant && !existingParticipant.isAddedManually) {
              return { ...existingParticipant, isVisible: false };
            }
            return existingParticipant;
          });

          // Combine results and remove duplicates
          const allParticipants = getUniqueParticipants([
            ...manuallyAddedParticipants,
            ...nonManuallyAddedParticipants,
          ]);

          console.log('allParticipants', allParticipants);

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                participants: sortByStatus(allParticipants),
                selectAllChecked: allParticipants.every(p => p.included),
              },
            },
          };
        }),
      setSelectAllChecked: (url, selectAllChecked) => {
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
      deleteParticipant: (url, id) =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participants: sortByStatus(
                  urlStore.participants.map(p => (p.id === id ? { ...p, isVisible: false } : p)),
                ),
              },
            },
          };
        }),
      toggleInclude: (url, id) =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          const updatedParticipants = urlStore.participants.map(p =>
            p.id === id ? { ...p, included: !p.included } : p,
          );

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                participants: sortByStatus(updatedParticipants),
                selectAllChecked: updatedParticipants.every(p => p.included),
              },
            },
          };
        }),
      togglePinTop: (url, id) =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participants: sortByStatus(
                  urlStore.participants.map(p =>
                    p.id === id ? { ...p, pinnedTop: !p.pinnedTop, pinnedBottom: false } : p,
                  ),
                ),
              },
            },
          };
        }),
      togglePinBottom: (url, id) =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participants: sortByStatus(
                  urlStore.participants.map(p =>
                    p.id === id ? { ...p, pinnedBottom: !p.pinnedBottom, pinnedTop: false } : p,
                  ),
                ),
              },
            },
          };
        }),
      toggleSelectAll: url =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          const newSelectAllState = !urlStore.selectAllChecked;
          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                participants: sortByStatus(urlStore.participants.map(p => ({ ...p, included: newSelectAllState }))),
                selectAllChecked: newSelectAllState,
              },
            },
          };
        }),
    }),
    {
      name: 'participants-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);

// Helper hook to access URL-specific store
export const useUrlParticipants = (url: string) => {
  const participants = useParticipantsStore(useShallow(state => state.urlStores[url]?.participants || []));
  const selectAllChecked = useParticipantsStore(useShallow(state => state.urlStores[url]?.selectAllChecked || false));
  const setParticipants = useParticipantsStore(useShallow(state => state.setParticipants));
  const deleteParticipant = useParticipantsStore(useShallow(state => state.deleteParticipant));
  const toggleInclude = useParticipantsStore(useShallow(state => state.toggleInclude));
  const togglePinTop = useParticipantsStore(useShallow(state => state.togglePinTop));
  const togglePinBottom = useParticipantsStore(useShallow(state => state.togglePinBottom));
  const toggleSelectAll = useParticipantsStore(useShallow(state => state.toggleSelectAll));
  const setSelectAllChecked = useParticipantsStore(useShallow(state => state.setSelectAllChecked));

  return {
    participants,
    selectAllChecked,
    setParticipants: (participants: ParticipantsListItem[]) => setParticipants(url, participants),
    deleteParticipant: (id: string) => deleteParticipant(url, id),
    toggleInclude: (id: string) => toggleInclude(url, id),
    togglePinTop: (id: string) => togglePinTop(url, id),
    togglePinBottom: (id: string) => togglePinBottom(url, id),
    toggleSelectAll: () => toggleSelectAll(url),
    setSelectAllChecked: (checked: boolean) => setSelectAllChecked(url, checked),
  };
};
