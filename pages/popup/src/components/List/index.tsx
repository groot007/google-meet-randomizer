import { type Group, type ParticipantsListItem } from '@src/types';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FaTimes } from 'react-icons/fa';
import { MdDoDisturbAlt } from 'react-icons/md';
import { useState } from 'react';
import { GroupSelectorPopup } from '../Group';
import { useGroupsStore } from '@src/store/groups';

type ListProps = {
  items: ParticipantsListItem[];
  onToggleInclude: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeGroup?: (id: string, group: Group) => void;
};

const List = ({ items, onToggleInclude, onDelete, onChangeGroup }: ListProps) => {
  const [animationParent] = useAutoAnimate();
  const [openIconSelector, setOpenIconSelector] = useState<string | null>(null);
  const visibleItems = items.filter(item => item.isVisible);
  const { groups: availableGroups } = useGroupsStore();
  const defaultGroup = availableGroups[0];

  console.log('AVAILABLE GROUPS', availableGroups);

  return (
    <ul ref={animationParent}>
      {visibleItems.map(item => (
        <li
          key={item.id}
          data-id={item.id}
          className={`flex items-center justify-between border-b border-gray-600 p-2 pl-0`}>
          <div className="flex items-center">
            <GroupSelectorPopup
              currentGroup={item.group || defaultGroup}
              onSelect={group => onChangeGroup?.(item.id, group)}
              isOpen={openIconSelector === item.id}
              availableGroups={availableGroups}
              onToggle={() => setOpenIconSelector(openIconSelector === item.id ? null : item.id)}
            />
            <div className={`flex items-center ${!item.included ? 'opacity-50' : ''}`}>
              <span className="break-all text-left text-base">{item.name}</span>
              {/* <span title="Added manually" className="ml-3">
                {item.isAddedManually && <FaUserTag />}
              </span> */}
            </div>
          </div>
          <div className={`flex items-center ${!item.included ? 'opacity-50' : ''}`}>
            <button
              onClick={() => onToggleInclude(item.id)}
              className="mr-1 text-gray-500 hover:text-gray-700"
              title={item.included ? 'Exclude from list' : 'Include in list'}>
              <MdDoDisturbAlt size={16} color={item.included ? '#FF7F7F' : 'white'} />
            </button>
            {item.isAddedManually && (
              <button
                onClick={() => onDelete(item.id)}
                className="ml-2 select-none text-red-500 hover:cursor-pointer hover:text-red-700">
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;
