import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import List from './components/List';
import { useCallback, useState } from 'react';
import { useParticipants, useCurrentUrl } from './hooks';
import { saveList, shuffleArray } from './utils';

const Popup = () => {
  const [newParticipant, setNewParticipant] = useState<string>('');
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const currentUrl = useCurrentUrl();
  const { participants, addParticipant, toggleInclude, deleteParticipant, setParticipants } =
    useParticipants(currentUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.trim() !== '') {
      addParticipant(newParticipant.trim());
      setNewParticipant('');
    }
  };

  const shaffleList = useCallback(() => {
    if (participants.length < 2) {
      return;
    }

    const shaffledList = shuffleArray(participants);
    setParticipants(shaffledList);
    // saveList(shaffledList, currentUrl);
  }, [participants, setParticipants]);

  const copyToClipboard = () => {
    const formattedList = participants.map((p, index) => `${index + 1}. ${p.name}`).join('\n');
    navigator.clipboard.writeText(formattedList).then(() => {
      console.log('Copied to clipboard');
    });
  };

  const sendToChat = () => {
    const formattedList = participants.map((p, index) => `${index + 1}. ${p.name}`).join('\n');
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentTab = tabs[0];
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, { action: 'sendToChat', message: formattedList }, response => {
          if (response?.success) {
            console.log('Message sent successfully');
          } else {
            console.log('ERROR sending message', response);
          }
        });
      }
    });
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-black' : 'bg-gray-800 text-white'} p-4`}>
      {participants.length === 0 && <div>No participants found</div>}
      {participants.length > 0 && (
        <div>
          Participants: <List items={participants} onToggleInclude={toggleInclude} onDelete={deleteParticipant} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={newParticipant}
          onChange={e => setNewParticipant(e.target.value)}
          className="mb-2 p-2 w-full border border-gray-300 rounded text-black"
          placeholder="Add a new participant"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Participant
        </button>
      </form>
      <br />
      <button onClick={shaffleList} className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Shuffle
      </button>
      <br />
      <button onClick={copyToClipboard} className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2">
        Copy to Clipboard
      </button>
      <br />
      <button onClick={sendToChat} className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 mt-2">
        Send to Google Meet Chat
      </button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
