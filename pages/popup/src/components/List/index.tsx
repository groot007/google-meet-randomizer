import { type ParticipantsListItem } from '@src/types';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FaArrowDown, FaThumbtack, FaTimes, FaUserTag } from 'react-icons/fa';
import { MdDoDisturbAlt } from 'react-icons/md';

type ListProps = {
  items: ParticipantsListItem[];
  onToggleInclude: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePinTop: (id: string) => void;
  onTogglePinBottom: (id: string) => void;
};

const List = ({ items, onToggleInclude, onDelete, onTogglePinTop, onTogglePinBottom }: ListProps) => {
  const [animationParent] = useAutoAnimate();
  const visibleItems = items.filter(item => item.isVisible);

  return (
    <ul ref={animationParent}>
      {visibleItems.map(item => (
        <li
          key={item.id}
          data-id={item.id}
          className={`flex items-center justify-between border-b border-gray-600 p-2 hover:opacity-95 ${
            !item.included ? 'opacity-50' : ''
          }`}>
          <div className="flex items-center">
            <button
              onClick={() => onTogglePinTop(item.id)}
              className={`mr-2 text-gray-500 hover:text-gray-700 ${item.pinnedTop ? 'text-yellow-500' : ''}`}
              title={item.pinnedTop ? 'Unpin' : 'Pin'}>
              <FaThumbtack size={16} />
            </button>
            <button
              onClick={() => onTogglePinBottom(item.id)}
              className={`mr-2 text-gray-500 hover:text-gray-700 ${item.pinnedBottom ? 'text-yellow-500' : ''}`}
              title={item.pinnedBottom ? 'Unpin from bottom' : 'Pin to bottom'}>
              <FaArrowDown size={16} />
            </button>

            <span className="break-all text-left text-base">{item.name}</span>
            <span title="Added manually" className="ml-3">
              {item.isAddedManually && <FaUserTag />}
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <button
                onClick={() => onToggleInclude(item.id)}
                className={`mr-1 text-gray-500 hover:text-gray-700 ${item.pinnedBottom ? 'text-yellow-500' : ''}`}
                title={item.included ? 'Exclude from list' : 'Include in list'}>
                <MdDoDisturbAlt size={16} color={item.included ? '#FF7F7F' : 'white'} />
              </button>
            </div>
            {item.isAddedManually && (
              <div className="flex items-center">
                <button
                  onClick={() => onDelete(item.id)}
                  className="ml-2 select-none text-red-500 hover:cursor-pointer hover:text-red-700">
                  <FaTimes size={16} />
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;
