import { type ParticipantsListItem } from '@src/types';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FaArrowDown, FaThumbtack, FaTimes } from 'react-icons/fa';

type ListProps = {
  items: ParticipantsListItem[];
  onToggleInclude: (index: number) => void;
  onDelete: (index: number) => void;
  onTogglePinTop: (index: number) => void;
  onTogglePinBottom: (index: number) => void;
};

const List = ({ items, onToggleInclude, onDelete, onTogglePinTop, onTogglePinBottom }: ListProps) => {
  const [animationParent] = useAutoAnimate();

  return (
    <ul ref={animationParent}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`flex items-center justify-between border-b border-gray-600 p-2 hover:opacity-95 ${
            !item.included ? 'opacity-50' : ''
          }`}>
          <div className="flex items-center">
            <button
              onClick={() => onTogglePinTop(index)}
              className={`mr-2 text-gray-500 hover:text-gray-700 ${item.pinnedTop ? 'text-yellow-500' : ''}`}
              title={item.pinnedTop ? 'Unpin' : 'Pin'}>
              <FaThumbtack size={16} />
            </button>
            <button
              onClick={() => onTogglePinBottom(index)}
              className={`mr-2 text-gray-500 hover:text-gray-700 ${item.pinnedBottom ? 'text-yellow-500' : ''}`}
              title={item.pinnedBottom ? 'Unpin from bottom' : 'Pin to bottom'}>
              <FaArrowDown size={16} />
            </button>
            <div className="flex items-center">
              <input
                className="mr-3 h-5 w-5 cursor-pointer"
                type="checkbox"
                checked={item.included}
                onChange={() => onToggleInclude(index)}
              />
            </div>
            <span className="break-all text-left text-base">{item.name}</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => onDelete(index)}
              className="ml-4 select-none text-red-500 hover:cursor-pointer hover:text-red-700">
              <FaTimes size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;
