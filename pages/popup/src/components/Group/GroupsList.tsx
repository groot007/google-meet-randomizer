import type { Group } from '@src/types';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GroupItem } from './GroupItem';

type GroupsListProps = {
  groups: Group[] | undefined;
  isLightTheme: boolean;
  onReorderGroups: (groups: Group[]) => void;
};

const GroupsList = ({ groups, isLightTheme, onReorderGroups }: GroupsListProps) => {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      if (!groups) return;
      const oldIndex = groups.findIndex(item => item.id === active.id);
      const newIndex = groups.findIndex(item => item.id === over?.id);
      const items = arrayMove(groups, oldIndex, newIndex);
      onReorderGroups(items);
    }
  }

  return (
    <div className={`mr-4 w-10 rounded-lg ${isLightTheme ? 'bg-gray-300' : 'bg-gray-700'}`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={groups?.map(group => group.id) || []} strategy={verticalListSortingStrategy}>
          {groups?.map((group, index) => (
            <GroupItem key={group.id || `group-${index}`} group={group} isLightTheme={isLightTheme} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default GroupsList;
