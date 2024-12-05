import { type ParticipantsListItem } from '@src/types';

export function shuffleArray(array: ParticipantsListItem[]) {
  if (array.length < 2) {
    return array;
  }

  const includedParticipants = array.filter(p => p.included);
  const excludedParticipants = array.filter(p => !p.included);

  let newOrder = [...includedParticipants];

  do {
    newOrder = fisherYatesShuffle(newOrder);
  } while (arraysEqual(newOrder, array));

  return [...newOrder, ...excludedParticipants];
}

const fisherYatesShuffle = (array: ParticipantsListItem[]): ParticipantsListItem[] => {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
};

const arraysEqual = (a: ParticipantsListItem[], b: ParticipantsListItem[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].name !== b[i].name) return false;
  }
  return true;
};
