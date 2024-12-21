import { v4 as uuidv4 } from 'uuid';
import { type ParticipantsListItem } from '@src/types';

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

export const getUniqueParticipants = (participants: ParticipantsListItem[]): ParticipantsListItem[] => {
  return participants.filter((participant, index, self) => index === self.findIndex(p => p.name === participant.name));
};
