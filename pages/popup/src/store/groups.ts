import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { chromeStorage } from '@extension/storage/lib/impl/chromeStorage';

export type Group = {
  id: string;
  label: string;
  color: string;
  type: 'text' | 'emoji';
};

type GroupsState = {
  groups: Group[];
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (groups: Group[]) => void;
};

export const useGroupsStore = create(
  persist<GroupsState>(
    set => ({
      groups: [
        { id: '1', label: '👑', color: '#FFD700', type: 'emoji' },
        { id: '2', label: '⭐', color: '#FFA500', type: 'emoji' },
        { id: '4', label: 'QA', color: '#800080', type: 'text' },
        { id: '5', label: 'PM', color: '#008000', type: 'text' },
      ],
      addGroup: group =>
        set(state => ({
          groups: [...state.groups, { ...group, id: crypto.randomUUID() }],
        })),
      updateGroup: (id, updates) =>
        set(state => ({
          groups: state.groups.map(g => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteGroup: id =>
        set(state => ({
          groups: state.groups.filter(g => g.id !== id),
        })),
      reorderGroups: groups => set({ groups }),
      cleanStorage: () => set({ groups: [] }),
    }),
    {
      name: 'groups-storage',
      storage: createJSONStorage(() => chromeStorage),
    },
  ),
);
