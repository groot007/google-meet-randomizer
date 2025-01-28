import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getUniqueParticipants, sortByStatus } from '../utils';
import { type Group, type ParticipantsListItem } from '@src/types';
import { useShallow } from 'zustand/react/shallow';
import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';

type ParticipantsState = {
  urlStores: Record<
    string,
    {
      participants: ParticipantsListItem[];
      selectAllChecked: boolean;
      participantGroups: Group[];
    }
  >;
  setParticipants: (url: string, participants: ParticipantsListItem[], observer?: boolean) => void;
  deleteParticipant: (url: string, id: string) => void;
  toggleInclude: (url: string, id: string) => void;
  togglePinTop: (url: string, id: string) => void;
  togglePinBottom: (url: string, id: string) => void;
  changeGroup: (url: string, id: string, group: Group) => void;
  setGroupsOrder: (url: string, groups: Group[]) => void;
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
              return existingParticipant
                ? {
                    ...existingParticipant,
                    isVisible: true,
                  }
                : newParticipant;
            }
            return newParticipant;
          });

          // Combine results and remove duplicates
          const allParticipants = getUniqueParticipants([...manuallyAddedParticipants, ...existingParticipants]);
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
      setGroupsOrder: (url, groups) => {
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participantGroups: groups,
              },
            },
          };
        });
      },
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
      changeGroup: (url: string, id: string, group: Group) =>
        set(state => {
          const urlStore = state.urlStores[url];
          if (!urlStore) return state;

          const updatedParticipants = urlStore.participants.map(participant => {
            if (participant.id === id) {
              return { ...participant, group };
            }
            return participant;
          });

          return {
            urlStores: {
              ...state.urlStores,
              [url]: {
                ...urlStore,
                participants: updatedParticipants,
              },
            },
          };
        }),
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
  const storeUrl = url || 'default';
  const participants = useParticipantsStore(useShallow(state => state.urlStores[storeUrl]?.participants || []));
  const selectAllChecked = useParticipantsStore(
    useShallow(state => state.urlStores[storeUrl]?.selectAllChecked || false),
  );
  const setParticipants = useParticipantsStore(useShallow(state => state.setParticipants));
  const deleteParticipant = useParticipantsStore(useShallow(state => state.deleteParticipant));
  const toggleInclude = useParticipantsStore(useShallow(state => state.toggleInclude));
  const togglePinTop = useParticipantsStore(useShallow(state => state.togglePinTop));
  const togglePinBottom = useParticipantsStore(useShallow(state => state.togglePinBottom));
  const changeGroup = useParticipantsStore(useShallow(state => state.changeGroup));
  const toggleSelectAll = useParticipantsStore(useShallow(state => state.toggleSelectAll));
  const setSelectAllChecked = useParticipantsStore(useShallow(state => state.setSelectAllChecked));
  const cleanStorage = useParticipantsStore(useShallow(state => state.cleanStorage));
  const setGroupsOrder = useParticipantsStore(useShallow(state => state.setGroupsOrder));
  const participantGroups = useParticipantsStore(
    useShallow(state => state.urlStores[storeUrl]?.participantGroups || []),
  );

  return {
    participants,
    selectAllChecked,
    participantGroups,
    cleanStorage: () => cleanStorage(storeUrl),
    setParticipants: (participants: ParticipantsListItem[], observer?: boolean) => {
      return setParticipants(storeUrl, participants, observer);
    },
    deleteParticipant: (id: string) => deleteParticipant(storeUrl, id),
    toggleInclude: (id: string) => toggleInclude(storeUrl, id),
    togglePinTop: (id: string) => togglePinTop(storeUrl, id),
    togglePinBottom: (id: string) => togglePinBottom(storeUrl, id),
    changeGroup: (id: string, group: Group) => changeGroup(storeUrl, id, group),
    setGroupsOrder: (group: Group[]) => setGroupsOrder(storeUrl, group),
    toggleSelectAll: () => toggleSelectAll(storeUrl),
    setSelectAllChecked: (checked: boolean) => setSelectAllChecked(storeUrl, checked),
  };
};
