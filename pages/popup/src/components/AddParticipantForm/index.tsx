import { generateUniqueId } from '@extension/shared';
import { type ParticipantsListItem } from '@src/types';
import { useState, type FormEvent } from 'react';
import { FaChevronUp, FaPlus } from 'react-icons/fa';

interface AddParticipantsFormProps {
  isLightTheme: boolean;
  onSubmit: (participants: ParticipantsListItem[]) => void;
}

export const AddParticipantsForm = ({ isLightTheme, onSubmit }: AddParticipantsFormProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newParticipants, setNewParticipants] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault?.();
    const newList = newParticipants
      .split('\n')
      .map(name => name.trim())
      .filter(name => name !== '')
      .map(name => ({
        name,
        included: true,
        pinnedTop: false,
        pinnedBottom: false,
        isAddedManually: true,
        group: {
          id: 'default_id',
          label: 'User',
          color: '#000',
        },
        id: generateUniqueId(),
        isVisible: true,
      }));

    if (newList.length === 0) {
      return;
    }

    onSubmit(newList as ParticipantsListItem[]);
    setNewParticipants('');
  };

  return (
    <div>
      <div className="my-4 flex justify-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center rounded bg-gray-500 p-2 text-white hover:bg-gray-600">
          {showForm ? <FaChevronUp /> : <FaPlus />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={newParticipants}
            onChange={e => setNewParticipants(e.target.value)}
            className={`w-full rounded border p-2 focus:outline-none ${
              isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'
            }`}
            placeholder="Add new participants, one per line"
            rows={3}
            autoFocus
          />
          <button type="submit" className="mt-2 w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
            Add Participant
          </button>
        </form>
      )}
    </div>
  );
};
