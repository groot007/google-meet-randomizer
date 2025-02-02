import { type Group } from '@src/types';
import GroupIcon from './GroupIcon';

type GroupSelectorProps = {
  currentGroup: Group;
  onSelect: (group: Group) => void;
  isOpen: boolean;
  onToggle: () => void;
  availableGroups: Group[];
};

const defaultGroup: Group = {
  id: 'default_id',
  label: 'User',
  color: '#000',
  type: 'text',
};

const GroupSelector = ({ currentGroup, onSelect, isOpen, onToggle, availableGroups }: GroupSelectorProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {isOpen && (
        <div className="absolute left-0 top-5 z-50 flex items-center rounded bg-gray-600 p-1 opacity-100 shadow-lg">
          {availableGroups.map(group => {
            return (
              <button
                key={group.label}
                onClick={() => {
                  onSelect(group);
                  onToggle();
                }}
                className="relative flex items-center px-2 text-xl text-gray-400 after:absolute after:right-[0px] after:top-1/2 after:h-4 after:w-[1px] after:-translate-y-1/2 after:bg-gray-200 last:after:hidden hover:text-gray-200">
                <GroupIcon group={group} />
              </button>
            );
          })}
          <button
            onClick={() => {
              onSelect(defaultGroup);
              onToggle();
            }}
            className="relative px-2 text-xl text-gray-400 after:absolute after:right-[0px] after:top-1/2 after:h-4 after:w-[1px] after:-translate-y-1/2 after:bg-gray-200 last:after:hidden hover:text-gray-200">
            <GroupIcon group={defaultGroup} />
          </button>
        </div>
      )}

      <button
        onClick={onToggle}
        className="z-1 hover:text-gray-bg-zinc-300 relative mr-2 flex border-r-2 border-r-slate-500 pr-2 text-gray-500">
        <GroupIcon group={currentGroup} />
      </button>
    </div>
  );
};

export default GroupSelector;
