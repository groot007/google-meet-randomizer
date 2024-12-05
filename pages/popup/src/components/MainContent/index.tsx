import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import List from '../List';
import { useCallback, useEffect, useState } from 'react';
import { useParticipants, useCurrentUrl } from '../../hooks';
import { generateListString, generateUniqueId, shuffleArray } from '../../utils';
import { FaRandom, FaClipboard, FaPaperPlane, FaPlus, FaChevronUp } from 'react-icons/fa';
import { RiCheckboxMultipleBlankLine, RiCheckboxMultipleLine } from 'react-icons/ri';
import { useSettingsStore } from '@src/store/settings';

type MainContentProps = {
  isLightTheme: boolean;
};

const MainContent = ({ isLightTheme }: MainContentProps) => {
  const [newParticipants, setNewParticipants] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showSendingTooltip, setShowSendingTooltip] = useState<boolean>(false);
  const [showAddParticipant, setShowAddParticipant] = useState<boolean>(false);
  const { listPrefix, listPostfix, listItemMarker } = useSettingsStore();
  const [isControlsDisabled, setIsControlsDisabled] = useState<boolean>(false);

  const currentUrl = useCurrentUrl();
  const {
    participants,
    addParticipants,
    selectAllChecked,
    toggleSelectAll,
    toggleInclude,
    togglePinTop,
    togglePinBottom,
    deleteParticipant,
    setParticipants,
  } = useParticipants(currentUrl);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const participantNames = newParticipants
        .split('\n')
        .map(name => name.trim())
        .filter(name => name !== '')
        .map(name => ({ name, included: true, pinnedTop: false, pinnedBottom: false, id: generateUniqueId() }));

      if (participantNames.length === 0) {
        return;
      }

      console.log('participantNames', participantNames);

      addParticipants(participantNames);
      setNewParticipants('');
    },
    [addParticipants, newParticipants],
  );

  const shuffleList = useCallback(() => {
    const pinnedTopParticipants = participants.filter(p => p.pinnedTop);
    const pinnedBottomParticipants = participants.filter(p => p.pinnedBottom);
    const unpinnedParticipants = participants.filter(p => !p.pinnedTop && !p.pinnedBottom);

    const shuffledUnpinned = shuffleArray(unpinnedParticipants);
    const shuffledList = [...pinnedTopParticipants, ...shuffledUnpinned, ...pinnedBottomParticipants];
    setParticipants(shuffledList);
    // saveList(shuffledList, currentUrl);
  }, [participants, setParticipants]);

  const copyToClipboard = () => {
    const filteredList = participants.filter(p => p.included);
    const formattedList = generateListString(filteredList, listPrefix, listPostfix, listItemMarker);
    navigator.clipboard.writeText(formattedList).then(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 800);
    });
  };

  const sendToChat = () => {
    const filteredList = participants.filter(p => p.included);
    const formattedList = generateListString(filteredList, listPrefix, listPostfix, listItemMarker);
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentTab = tabs[0];
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, { action: 'sendToChat', message: formattedList }, response => {
          if (response?.success) {
            setShowSendingTooltip(true);
            console.log('Message sent successfully');
            setTimeout(() => setShowSendingTooltip(false), 800);
          } else {
            console.log('ERROR sending message', response);
          }
        });
      }
    });
  };

  useEffect(() => {
    setIsControlsDisabled(participants.length === 0);
  }, [participants]);

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <button
          title="Select all"
          onClick={toggleSelectAll}
          disabled={isControlsDisabled}
          className={`flex h-9 w-9 items-center rounded bg-gray-400 p-1 ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
          {selectAllChecked ? (
            <RiCheckboxMultipleLine size={46} className="text-white" />
          ) : (
            <RiCheckboxMultipleBlankLine size={46} className="text-white" />
          )}
        </button>
        <button
          title="Shuffle List"
          onClick={shuffleList}
          disabled={isControlsDisabled}
          className={`flex h-9 w-9 items-center justify-center rounded bg-blue-500 p-2 text-white ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-600'}`}>
          <FaRandom size={18} />
        </button>

        <div className="relative">
          <button
            title="Copy to Clipboard"
            onClick={copyToClipboard}
            disabled={isControlsDisabled}
            className={`flex h-9 w-9 items-center justify-center rounded bg-green-500 p-2 text-white ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-600'}`}>
            <FaClipboard size={18} />
          </button>
          {showTooltip && (
            <div className="absolute top-full mt-1 w-max rounded bg-black p-1 text-xs text-white">Copied!</div>
          )}
        </div>

        <div className="relative">
          <button
            title="Send to Google meet chat"
            onClick={sendToChat}
            disabled={isControlsDisabled}
            className={`flex h-9 w-9 items-center justify-center rounded bg-purple-500 p-2 text-white ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-purple-600'}`}>
            <FaPaperPlane size={18} />
          </button>
          {showSendingTooltip && (
            <div className="absolute top-full mt-1 w-max rounded bg-black p-1 text-xs text-white">Sent!</div>
          )}
        </div>
      </div>
      {participants.length === 0 && (
        <div className="mt-7">No participants found. Open Google meet tab or add items manually</div>
      )}
      {participants.length > 0 && (
        <>
          <h1 className="text-lg font-bold">Participants: </h1>

          <div className={`custom-scrollbar max-h-[300px] ${participants.length > 7 ? 'overflow-y-auto' : ''}`}>
            <List
              items={participants}
              onToggleInclude={toggleInclude}
              onTogglePinTop={togglePinTop}
              onTogglePinBottom={togglePinBottom}
              onDelete={deleteParticipant}
            />
          </div>
        </>
      )}
      <div className="mb-0 mt-4 flex items-center justify-center">
        <button
          onClick={() => setShowAddParticipant(!showAddParticipant)}
          className="flex items-center justify-center rounded bg-gray-500 p-2 text-white hover:bg-gray-600">
          {showAddParticipant ? <FaChevronUp /> : <FaPlus />}
        </button>
      </div>

      {showAddParticipant && (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={newParticipants}
            onChange={e => setNewParticipants(e.target.value)}
            className={`w-full rounded border p-2 ${isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
            placeholder="Add new participants, one per line"
            rows={3}
            // eslint-disable-next-line jsx-a11y/no-autofocus
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

export default withErrorBoundary(withSuspense(MainContent, <div>Loading...</div>), <div>Error Occurred</div>);
