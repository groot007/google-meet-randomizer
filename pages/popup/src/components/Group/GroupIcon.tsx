import React from 'react';
import { type Group } from '../../store/groups';
import { FaUserAlt } from 'react-icons/fa';

type GroupIconProps = {
  group: Group;
};

const GroupIcon = ({ group }: GroupIconProps) => {
  if (group.label === 'User') {
    return (
      <div className="flex h-6 w-6 items-center justify-center">
        <FaUserAlt size={16} />
      </div>
    );
  }

  if (group.type === 'emoji') {
    return <div className="flex h-6 w-6 items-center text-[20px]">{group.label}</div>;
  }

  const splitLabel = group.label.split(' ');
  const cropLabel =
    group.label.split(' ').length > 1 ? splitLabel[0].charAt(0) + splitLabel[1].charAt(0) : group.label.substring(0, 2);

  return (
    <div
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
      style={{
        backgroundColor: group.color,
        color: '#fff',
      }}>
      {cropLabel.toUpperCase()}
    </div>
  );
};

export default GroupIcon;
