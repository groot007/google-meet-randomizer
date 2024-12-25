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
  setParticipants: (url: string, participants: ParticipantsListItem[], observer?: boolean) => void;
  deleteParticipant: (url: string, id: string) => void;
  toggleInclude: (url: string, id: string) => void;
  togglePinTop: (url: string, id: string) => void;
  togglePinBottom: (url: string, id: string) => void;
  toggleSelectAll: (url: string) => void;
  setSelectAllChecked: (url: string, selectAllChecked: boolean) => void;
  cleanStorage: (url: string) => void;
};

export const useParticipantsStore = create(
  persist<ParticipantsState>(
    set => ({
      urlStores: {},
      setParticipants: (url, participants, observerAdded) =>
        set(state => {
          let existingParticipants = [...(state.urlStores[url]?.participants || [])];
          const updatedList = getUniqueParticipants(participants);

          const newParticipants = [] as ParticipantsListItem[];
          console.log('IS OVE', observerAdded);
          if (observerAdded) {
            updatedList.forEach(updatedParticipant => {
              const oldParticipant = existingParticipants.find(p => p.name === updatedParticipant.name);
              if (!oldParticipant) {
                newParticipants.push(updatedParticipant);
              } else {
                existingParticipants = existingParticipants.map(participant => {
                  if (participant.isAddedManually) return participant;

                  return {
                    ...participant,
                    isVisible: updatedList.some(p => p.name === participant.name) ? true : false,
                  };
                });
              }

              return;
            });

            return {
              urlStores: {
                ...state.urlStores,
                [url]: {
                  participants: sortByStatus(getUniqueParticipants([...newParticipants, ...existingParticipants])),
                  selectAllChecked: updatedList.every(p => p.included),
                },
              },
            };
          }

          // Handle manually added participants
          const manuallyAddedParticipants = updatedList.map(newParticipant => {
            const existingParticipant = existingParticipants.find(p => p.name === newParticipant.name);
            if (newParticipant.isAddedManually) {
              return existingParticipant ? { ...existingParticipant, isVisible: true } : newParticipant;
            }
            return newParticipant;
          });

          // Combine results and remove duplicates
          const allParticipants = getUniqueParticipants([...manuallyAddedParticipants, ...existingParticipants]);

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
  const cleanStorage = useParticipantsStore(useShallow(state => state.cleanStorage));

  return {
    participants,
    selectAllChecked,
    cleanStorage: () => cleanStorage(url),
    setParticipants: (participants: ParticipantsListItem[], observer?: boolean) => {
      console.log('IS _B_V__V_V_V__V', observer);
      return setParticipants(url, participants, observer);
    },
    deleteParticipant: (id: string) => deleteParticipant(url, id),
    toggleInclude: (id: string) => toggleInclude(url, id),
    togglePinTop: (id: string) => togglePinTop(url, id),
    togglePinBottom: (id: string) => togglePinBottom(url, id),
    toggleSelectAll: () => toggleSelectAll(url),
    setSelectAllChecked: (checked: boolean) => setSelectAllChecked(url, checked),
  };
};
