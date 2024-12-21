export type ParticipantsListItem = {
  id: string;
  name: string;
  included: boolean;
  pinnedTop?: boolean;
  pinnedBottom?: boolean;
  isAddedManually?: boolean;
};
