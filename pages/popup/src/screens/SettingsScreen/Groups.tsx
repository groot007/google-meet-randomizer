import React from 'react';
import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

import { useGroupsStore } from '../../store/groups';
import GroupIcon from '@src/components/Group/GroupIcon';
import { useUIStore } from '@src/store/ui';
import { FaRegSmile, FaTimes } from 'react-icons/fa';
import { MdColorize } from 'react-icons/md';

const generateColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const GroupSettings = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = useGroupsStore();
  const [showPicker, setShowPicker] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { isLightTheme } = useUIStore();

  const handleEmojiSelect = (emoji: any) => {
    if (activeGroupId) {
      updateGroup(activeGroupId, { label: emoji.emoji, type: 'emoji' });
    }
    setShowPicker(false);
  };

  return (
    <div className="w-full">
      <h2 className="text-md mb-2 font-semibold">Group Settings</h2>
      <div className="space-y-5">
        {groups.map(group => (
          <div key={group.id} className="flex w-full items-center justify-start space-x-2">
            <input
              id="listPostfix"
              type="text"
              value={group.label}
              placeholder="ex. Have a great day!"
              onChange={e => updateGroup(group.id, { label: e.target.value, type: 'text' })}
              className={`w-1/2 rounded border p-2 ${isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
            />

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setActiveGroupId(group.id);
                  setShowPicker(true);
                }}
                className="text-[20px]">
                <FaRegSmile />
              </button>

              <div className="relative">
                <div className="absolute bottom-2 right-1 flex items-center space-x-2">
                  <MdColorize />
                </div>
                <input
                  type="color"
                  value={group.color}
                  onChange={e => updateGroup(group.id, { color: e.target.value })}
                  className="h-8 w-8 bg-transparent"
                />
              </div>
            </div>
            <button onClick={() => deleteGroup(group.id)} className="text-red-500">
              <FaTimes size={16} />
            </button>
            <div className="ml-auto flex w-full items-center justify-end">
              <div className="flex h-6 items-center">
                <GroupIcon group={group} />
              </div>
              <div className="ml-3 flex h-6 items-center">
                <span>User Name</span>
              </div>
            </div>
          </div>
        ))}

        {showPicker && (
          <div ref={pickerRef} className="absolute top-0 z-50">
            <EmojiPicker
              reactionsDefaultOpen={true}
              onReactionClick={handleEmojiSelect}
              onEmojiClick={handleEmojiSelect}
              width={300}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => addGroup({ label: 'New Group', color: generateColor(), type: 'text' })}
        className="mt-4 flex items-center space-x-2 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
        Add Group
      </button>
    </div>
  );
};

export default GroupSettings;
