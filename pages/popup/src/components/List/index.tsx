import { type ParticipantsListItem } from '@src/types';
import { useAutoAnimate } from '@formkit/auto-animate/react';

type ListProps = {
  items: ParticipantsListItem[];
  onToggleInclude: (index: number) => void;
  onDelete: (index: number) => void;
};

const List = ({ items, onToggleInclude, onDelete }: ListProps) => {
  const [animationParent] = useAutoAnimate();

  return (
    <ul ref={animationParent}>
      {items.map((item, index) => (
        <li
          key={item.name}
          className={`flex items-center justify-between p-2 border-b border-gray-300 hover:opacity-95 ${
            !item.included ? 'opacity-80' : ''
          }`}>
          <div className="flex items-center">
            <input type="checkbox" checked={item.included} onChange={() => onToggleInclude(index)} className="mr-2" />
            <span>{item.name}</span>
          </div>
          <button
            onClick={() => onDelete(index)}
            className="text-red-500 hover:text-red-700 hover:cursor-pointer select-none">
            &times;
          </button>
        </li>
      ))}
    </ul>
  );
};

export default List;
