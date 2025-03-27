import { generateUniqueId } from '@extension/shared';
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

export const generateListString = (participants: ParticipantsListItem[], prefix = '', postfix = '', marker = '') => {
  const list = participants
    .map((p, index) => {
      if (!marker) return p.name;
      const markerMasked = marker.replaceAll('#', String(index + 1));
      return `${markerMasked || index + 1 + '.'} ${p.name}`;
    })
    .join('\n');
  const textBeforeList = prefix ? `${prefix}\n` : '';
  const textAfterList = postfix ? `\n${postfix}` : '';
  return `${textBeforeList}${list}${textAfterList}`;
};

export const getUniqueParticipants = (participants: ParticipantsListItem[]): ParticipantsListItem[] => {
  return participants.filter((participant, index, self) => index === self.findIndex(p => p.name === participant.name));
};

export const groupByLabel = <T extends Record<string, any>>(array: T[]) => {
  const grouped = array.reduce(
    (acc, item) => {
      const key = item.group.label;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );

  return grouped;
};

export const mergeParticipants = (
  newParticipants: any[],
  storedParticipants: ParticipantsListItem[],
): ParticipantsListItem[] => {
  const participantsByName = new Map(storedParticipants.map(p => [p.name, { ...p, isVisible: p.isAddedManually }]));

  const storedNames = new Set(storedParticipants.map(p => p.name));

  for (const newP of newParticipants) {
    const stored = participantsByName.get(newP.name);
    if (!stored?.isAddedManually) {
      participantsByName.set(newP.name, {
        ...newP,
        included: stored?.included ?? true,
        pinnedTop: stored?.pinnedTop ?? false,
        pinnedBottom: stored?.pinnedBottom ?? false,
        id: stored?.id ?? generateUniqueId(),
        isVisible: true,
        group: stored?.group ?? {
          id: 'default_id',
          type: 'icon',
          label: 'User',
          color: '#000',
        },
      });
    }
  }

  // Maintain order of stored participants and append new ones
  return [
    ...storedParticipants.map(p => participantsByName.get(p.name)).filter(Boolean),
    ...Array.from(participantsByName.values())
      .filter(p => !storedNames.has(p.name))
      .filter(Boolean),
  ];
};
