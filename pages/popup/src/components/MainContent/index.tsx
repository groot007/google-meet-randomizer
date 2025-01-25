import '@src/Popup.css';
import { generateUniqueId, withErrorBoundary, withSuspense } from '@extension/shared';
import List from '../List';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentUrl, useInitContentScript } from '../../hooks';
import { generateListString, shuffleArray } from '../../utils';
import { FaRandom, FaClipboard, FaPaperPlane, FaRegTrashAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { RiCheckboxMultipleBlankLine, RiCheckboxMultipleLine } from 'react-icons/ri';
import { useSettingsStore } from '@src/store/settings';
import { ControlButton } from '../ControlButton';
import { AddParticipantsForm } from '@src/components/AddParticipantForm';
import { type ParticipantsListItem } from '@src/types';
import { useUrlParticipants } from '@src/store/list';
import { useUIStore } from '@src/store/ui';
import { SearchInput } from '../SearchInput';

const MainContent = () => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showSendingTooltip, setShowSendingTooltip] = useState<boolean>(false);
  const { listPrefix, listPostfix, listItemMarker } = useSettingsStore();
  const isLightTheme = useUIStore(state => state.isLightTheme);
  const [isControlsDisabled, setIsControlsDisabled] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const clearSearch = () => setSearchTerm('');

  const selectRandomParticipant = () => {
    const visibleParticipants = participants.filter(p => p.isVisible);
    if (visibleParticipants.length) {
      const randomParticipant = visibleParticipants[Math.floor(Math.random() * visibleParticipants.length)];
      setSearchTerm(randomParticipant.name);
    }
  };

  const currentUrl = useCurrentUrl();
  const isGoogleMeet = currentUrl.includes('meet.google.com');
  const isSendToChatDisabled = isControlsDisabled || !isGoogleMeet;
  const {
    participants,
    setParticipants,
    deleteParticipant,
    toggleInclude,
    selectAllChecked,
    setSelectAllChecked,
    toggleSelectAll,
    togglePinTop,
    togglePinBottom,
    cleanStorage,
  } = useUrlParticipants(currentUrl);

  useInitContentScript(currentUrl, isGoogleMeet);

  useEffect(() => {
    if (!isGoogleMeet) return;

    const fetchParticipants = async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentTab = tabs[0];
        if (currentTab?.id) {
          chrome.tabs.sendMessage(currentTab.id, { action: 'getParticipants' }, response => {
            if (response && response.participants) {
              const participants = response.participants.map((p: ParticipantsListItem) => ({
                name: p.name,
                included: true,
                pinnedTop: false,
                pinnedBottom: false,
                id: generateUniqueId(),
                isVisible: true,
              }));
              setParticipants(participants, true);
            }
          });
        }
      });
    };

    fetchParticipants();
  }, [currentUrl]);

  useEffect(() => {
    if (!isGoogleMeet) return;

    chrome.runtime.onMessage.addListener(async request => {
      if (request.action === 'updateParticipants') {
        const updatedList = request.participants.map((p: ParticipantsListItem) => ({
          name: p.name,
          included: true,
          pinnedTop: false,
          pinnedBottom: false,
          id: generateUniqueId(),
          isVisible: true,
        }));

        if (updatedList.length) {
          setParticipants(updatedList, true);
        }
      }
    });
  }, [setParticipants, currentUrl]);

  useEffect(() => {
    const allSelected = participants.every(p => p.included);
    setSelectAllChecked(allSelected);
  }, [participants, setSelectAllChecked]);

  const handleAddParticipants = useCallback(
    (participants: ParticipantsListItem[]) => {
      setParticipants(participants);
    },
    [setParticipants],
  );

  const shuffleList = useCallback(() => {
    const visibleParticipants = participants.filter(p => p.isVisible);
    const pinnedTopParticipants = visibleParticipants.filter(p => p.pinnedTop);
    const pinnedBottomParticipants = visibleParticipants.filter(p => p.pinnedBottom);
    const unpinnedParticipants = visibleParticipants.filter(p => !p.pinnedTop && !p.pinnedBottom);

    const shuffledUnpinned = shuffleArray(unpinnedParticipants);
    const shuffledList = [...pinnedTopParticipants, ...shuffledUnpinned, ...pinnedBottomParticipants];
    setParticipants(shuffledList);
  }, [participants, setParticipants]);

  const timeout = useRef<NodeJS.Timeout>(null);
  const copyToClipboard = () => {
    clearTimeout(timeout.current);
    const filteredList = participants.filter(p => p.included && p.isVisible);
    const formattedList = generateListString(filteredList, listPrefix, listPostfix, listItemMarker);

    navigator.clipboard.writeText(formattedList).then(() => {
      setShowTooltip(true);
      timeout.current = setTimeout(() => setShowTooltip(false), 800);
    });
  };

  const sendToChat = () => {
    const filteredList = participants.filter(p => p.included && p.isVisible);
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

  const removeAllParticipants = () => {
    cleanStorage();
  };

  useEffect(() => {
    setIsControlsDisabled(participants.length === 0);
  }, [participants]);

  return (
    <div>
      <div className="mb-4 flex justify-end space-x-4">
        <ControlButton
          title="Shuffle List"
          onClick={shuffleList}
          disabled={isControlsDisabled}
          icon={<FaRandom size={18} />}
          variant="blue"
        />

        <ControlButton
          title="Copy to Clipboard"
          onClick={copyToClipboard}
          disabled={isControlsDisabled}
          icon={<FaClipboard size={18} />}
          variant="green"
          showTooltip={showTooltip}
          tooltipText="Copied!"
        />

        <ControlButton
          title="Send to Google meet chat"
          onClick={sendToChat}
          disabled={isSendToChatDisabled}
          icon={<FaPaperPlane size={18} />}
          variant="purple"
          showTooltip={showSendingTooltip}
          tooltipText="Sent!"
        />
      </div>
      {participants.length === 0 && <div className="mt-7">Open Google meet tab or add items manually</div>}
      {participants.length > 0 && (
        <div>
          <div className="my-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              onRandomSelect={selectRandomParticipant}
              isLightTheme={isLightTheme}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="mr-2 size-5"></div>
            <div className="mr-2 size-5"></div>

            <h1 className="text-lg font-bold">Participants ({participants.filter(p => p.isVisible).length}): </h1>
            <button
              title="Select all"
              onClick={toggleSelectAll}
              disabled={isControlsDisabled}
              className={`ml-auto mr-2 flex size-5 items-center rounded hover:text-gray-300 ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              {selectAllChecked ? <RiCheckboxMultipleLine size={18} /> : <RiCheckboxMultipleBlankLine size={18} />}
            </button>
            <button
              onClick={removeAllParticipants}
              className="mr-2 select-none text-red-500 hover:cursor-pointer hover:text-red-700">
              <FaRegTrashAlt size={16} />
            </button>
          </div>
          <div className={`custom-scrollbar max-h-[300px] ${participants.length > 7 ? 'overflow-y-auto' : ''}`}>
            <List
              items={participants.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))}
              onToggleInclude={toggleInclude}
              onTogglePinTop={togglePinTop}
              onTogglePinBottom={togglePinBottom}
              onDelete={deleteParticipant}
            />
          </div>
        </div>
      )}
      <AddParticipantsForm isLightTheme={isLightTheme} onSubmit={handleAddParticipants} />
    </div>
  );
};

export default withErrorBoundary(withSuspense(MainContent, <div>Loading...</div>), <div>Error Occurred</div>);
