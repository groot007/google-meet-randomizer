import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GroupIcon from './GroupIcon';
import type { Group } from '@src/types';

export function GroupItem({ group, isLightTheme }: { group: Group; isLightTheme: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div key={group.id} ref={setNodeRef} style={style} {...attributes} {...listeners} key={group.id}>
      <div
        className={`relative mb-3 flex items-center justify-center rounded-md ${isLightTheme ? 'bg-white' : 'bg-gray-600'} cursor-grab before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:text-[20px] before:opacity-50 before:content-['⋮'] hover:opacity-80`}
        style={{
          color: '#fff',
          backgroundColor: group.type === 'emoji' ? 'transparent' : group.color,
          fontSize: group.type === 'emoji' ? '20px' : '14px',
        }}>
        <GroupIcon group={group} />
      </div>
    </div>
  );
}
