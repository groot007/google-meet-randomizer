import type { Group } from '@src/types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import GroupIcon from '../Group/GroupIcon';

type GroupsListProps = {
  groups: Group[] | undefined;
  isLightTheme: boolean;
  onReorderGroups: (groups: Group[]) => void;
};

const GroupsList = ({ groups, isLightTheme, onReorderGroups }: GroupsListProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(groups);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderGroups(items);
  };

  return (
    <div className={`mr-4 w-10 rounded-lg ${isLightTheme ? 'bg-gray-300' : 'bg-gray-700'}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="groups">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="p-2">
              {groups?.map((group, index) => {
                return (
                  <Draggable key={group.label} draggableId={group.label} index={index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative mb-3 flex items-center justify-center rounded-md ${isLightTheme ? 'bg-white' : 'bg-gray-600'} cursor-grab before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:text-[20px] before:opacity-50 before:content-['⋮'] hover:opacity-80`}
                        style={{
                          ...provided.draggableProps.style,
                          color: '#fff',
                          backgroundColor: group.type === 'emoji' ? 'transparent' : group.color,
                          fontSize: group.type === 'emoji' ? '20px' : '14px',
                        }}>
                        <GroupIcon group={group} />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default GroupsList;
