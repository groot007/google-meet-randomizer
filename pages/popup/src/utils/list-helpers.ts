import { type ParticipantsListItem } from '@src/types';

export const mergeParticipants = (
  newParticipants: ParticipantsListItem[],
  storedParticipants: ParticipantsListItem[],
): ParticipantsListItem[] => {
  const merged = [...storedParticipants];

  newParticipants.forEach(newParticipant => {
    const existingIndex = merged.findIndex(p => p.name === newParticipant.name);
    if (existingIndex !== -1) {
      // Update the included status if the participant already exists
      merged[existingIndex].included = newParticipant.included;
    } else {
      // Add the new participant if it doesn't exist
      merged.push(newParticipant);
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
  const included = list.filter(el => el.included);
  const excluded = list.filter(el => !el.included);
  return [...included, ...excluded];
};
