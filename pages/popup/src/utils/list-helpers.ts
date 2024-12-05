import { v4 as uuidv4 } from 'uuid';
import { type ParticipantsListItem } from '@src/types';

export const mergeParticipants = (
  newParticipants: ParticipantsListItem[],
  savedParticipants: ParticipantsListItem[],
): ParticipantsListItem[] => {
  const merged = [...savedParticipants];

  newParticipants.forEach(newParticipant => {
    const existingIndex = merged.findIndex(p => p.name === newParticipant.name);
    if (existingIndex !== -1) {
      // Update the included and pinned status if the participant already exists
      merged[existingIndex].included = savedParticipants.find(p => p.name === newParticipant.name)?.included ?? true;
      merged[existingIndex].pinnedTop = savedParticipants.find(p => p.name === newParticipant.name)?.pinnedTop ?? false;
      merged[existingIndex].pinnedBottom =
        savedParticipants.find(p => p.name === newParticipant.name)?.pinnedBottom ?? false;
    } else {
      // Add the new participant if it doesn't exist
      merged.push({
        id: generateUniqueId(),
        name: newParticipant.name,
        included: true,
        pinnedTop: false,
        pinnedBottom: false,
      });
    }
  });

  return merged;
};

export const loadSavedList = async (url: string): Promise<ParticipantsListItem[]> => {
  const key = `participants_${url}`;
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      if (result[key]) {
        const parsed = JSON.parse(result[key]);
        resolve(parsed);
      } else {
        resolve([]);
      }
    });
  });
};

export const saveList = async (list: ParticipantsListItem[], url: string): Promise<void> => {
  const key = `participants_${url}`;
  await chrome.storage.local.set({
    [key]: JSON.stringify(list),
  });
};

export const sortByStatus = (list: ParticipantsListItem[]): ParticipantsListItem[] => {
  return list.sort((a, b) => {
    if (a.pinnedTop && !b.pinnedTop) return -1;
    if (!a.pinnedTop && b.pinnedTop) return 1;
    if (!a.included && b.included) return 1;
    if (a.included && !b.included) return -1;
    if (a.pinnedBottom && !b.pinnedBottom) return 1;
    if (!a.pinnedBottom && b.pinnedBottom) return -1;
    return 0;
  });
};

export const generateUniqueId = (): string => {
  return uuidv4();
};

export const generateListString = (participants: ParticipantsListItem[], prefix = '', postfix = '', marker = '') => {
  const list = participants
    .map((p, index) => {
      const markerMasked = marker.replaceAll('#', String(index + 1));
      return `${markerMasked || index + 1 + '.'} ${p.name}`;
    })
    .join('\n');
  return `${prefix}\n${list}\n${postfix}`;
};
