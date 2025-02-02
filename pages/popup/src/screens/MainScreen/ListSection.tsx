import React, { useEffect } from 'react';
import List from '@src/components/List';
import { GroupsList } from '@src/components/Group';
import { useUrlParticipants } from '@src/store/list';
import { useCurrentUrl } from '../../hooks';
import { useUIStore } from '@src/store/ui';
import { type Group } from '@src/types';
import { groupByLabel, sortByStatus } from '@src/utils';

type ListSectionProps = {
  searchTerm: string;
};

const ListSection = ({ searchTerm }: ListSectionProps) => {
  const currentUrl = useCurrentUrl();
  const isGoogleMeet = currentUrl.includes('meet.google.com');
  const isLightTheme = useUIStore(state => state.isLightTheme);

  const { participants, setParticipants, groups, setGroupsOrder } = useUrlParticipants(isGoogleMeet ? currentUrl : '');

  const filteredParticipants = participants.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const reorderGroups = (groups: Group[]) => {
    setGroupsOrder(groups);
  };

  const toggleInclude = (id: string) => {
    const updatedParticipants = participants.map(p => (p.id === id ? { ...p, included: !p.included } : p));
    const sorted = sortByStatus(updatedParticipants);
    setParticipants(sorted);
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const changeGroup = (id: string, group: Group) => {
    const withNewGroup = participants.map(p => (p.id === id ? { ...p, group } : p));
    const groupedByLabel = groupByLabel(withNewGroup);
    const newList = [] as typeof participants;
    Object.keys(groupedByLabel).forEach(key => {
      newList.push(...groupedByLabel[key]);
    });
    setParticipants(newList);
  };

  useEffect(() => {
    const visibleParticipants = participants.filter(p => p.isVisible);
    const groupedByLabel = groupByLabel(visibleParticipants);

    const existingGroups = groups.filter(group => Object.keys(groupedByLabel).includes(group.label));

    const newGroups = Object.values(groupedByLabel)
      .map(group => group[0].group)
      .filter(group => !groups.find(g => g.label === group.label));

    setGroupsOrder([...existingGroups, ...newGroups]);
  }, [groups, participants, setGroupsOrder]);

  useEffect(() => {
    const grouped = groupByLabel(participants);

    const orderedParticipants = groups
      .map(group => grouped[group.label])
      .flat()
      .filter(Boolean);

    const remainingParticipants = participants.filter(p => !orderedParticipants.find(op => op.id === p.id));

    const finalList = [...orderedParticipants, ...remainingParticipants];

    setParticipants(finalList);
  }, [groups, participants, setParticipants]);
  return (
    <div className="flex">
      {groups.length > 1 && (
        <div className="mt-2">
          <GroupsList groups={groups} isLightTheme={isLightTheme} onReorderGroups={reorderGroups} />
        </div>
      )}

      <div className={`custom-scrollbar max-h-[300px] w-full ${participants.length > 7 ? 'overflow-y-auto' : ''}`}>
        <List
          items={filteredParticipants}
          onToggleInclude={toggleInclude}
          onDelete={deleteParticipant}
          onChangeGroup={(id, group) => {
            changeGroup(id, group);
          }}
        />
      </div>
    </div>
  );
};

export default ListSection;
