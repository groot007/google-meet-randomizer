export type Group = {
  label: string;
  color: string;
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
