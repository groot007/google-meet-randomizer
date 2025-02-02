export type Group = {
  label: string;
  color: string;
  type: 'text' | 'emoji';
  id: string;
};

export type ParticipantsListItem = {
  id: string;
  name: string;
  included: boolean;
  group: Group;
  pinnedTop?: boolean;
  pinnedBottom?: boolean;
  isAddedManually?: boolean;
  isVisible?: boolean;
};
