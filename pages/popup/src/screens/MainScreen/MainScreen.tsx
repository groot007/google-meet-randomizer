import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentUrl, useInitContentScript } from '../../hooks';
import { generateListString, groupByLabel, mergeParticipants, shuffleArray } from '../../utils';
import { FaRandom, FaClipboard, FaPaperPlane, FaRegTrashAlt } from 'react-icons/fa';
import { RiCheckboxMultipleBlankLine, RiCheckboxMultipleLine } from 'react-icons/ri';
import { useSettingsStore } from '@src/store/settings';
import { ControlButton } from '../../components/ControlButton';
import { AddParticipantsForm } from '@src/components/AddParticipantForm';
import { type ParticipantsListItem } from '@src/types';
import { useUrlParticipants } from '@src/store/list';
import { useUIStore } from '@src/store/ui';
import { SearchInput } from '../../components/SearchInput';
import ListSection from './ListSection';
import { ErrorCleanStorage } from '@src/components/ErrorBounding';
import { MdGroupRemove } from 'react-icons/md';

type TimeoutId = ReturnType<typeof setTimeout>;

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

  const { participants, setParticipants, isSelectAllChecked, setSelectAllStatus, cleanStorage, groups } =
    useUrlParticipants(isGoogleMeet ? currentUrl : '');

  const participantsRef = useRef(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const toggleSelectAll = useCallback(() => {
    setParticipants(participants.map(p => ({ ...p, included: !isSelectAllChecked })));
    setSelectAllStatus(!isSelectAllChecked);
  }, [participants, isSelectAllChecked, setParticipants, setSelectAllStatus]);

  useInitContentScript(currentUrl, isGoogleMeet);

  useEffect(() => {
    if (!isGoogleMeet) return;

    const fetchParticipants = async () => {
      // Give content script some time to fully initialize and setup observers
      await new Promise(resolve => setTimeout(resolve, 2000));

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentTab = tabs[0];
        if (currentTab?.id) {
          chrome.tabs.sendMessage(currentTab.id, { action: 'getParticipants' }, response => {
            if (response?.participants) {
              // Use current participants from the ref to avoid stale closure
              const mergedList = mergeParticipants(response.participants, participantsRef.current);
              setParticipants(mergedList);
            }
          });
        }
      });
    };

    fetchParticipants();
  }, [currentUrl, isGoogleMeet, setParticipants]);

  useEffect(() => {
    if (!isGoogleMeet) return;

    chrome.runtime.onMessage.addListener(async request => {
      if (request.action === 'updateParticipants') {
        const mergedList = mergeParticipants(request.participants, participants);

        if (mergedList.length) {
          setParticipants(mergedList);
        }
      }
    });
  }, [setParticipants, currentUrl, participants, isGoogleMeet]);

  useEffect(() => {
    const allSelected = participants.every(p => p.included);
    setSelectAllStatus(allSelected);
  }, [participants, setSelectAllStatus]);

  const handleAddParticipants = useCallback(
    (newParticipants: ParticipantsListItem[]) => {
      setParticipants([...participants, ...newParticipants]);
    },
    [participants, setParticipants],
  );

  const handleCleanGroups = useCallback(() => {
    const participatnsWithoutGroups = participants.map(p => ({
      ...p,
      group: {
        id: 'default_id',
        type: 'text',
        label: 'User',
        color: '#000',
      } as ParticipantsListItem['group'],
    }));
    setParticipants(participatnsWithoutGroups);
  }, [participants, setParticipants]);

  const shuffleList = useCallback(() => {
    const visibleParticipants = participants.filter(p => p.isVisible);
    const unpinnedParticipants = visibleParticipants.filter(p => !p.pinnedTop && !p.pinnedBottom);
    const grouped = groupByLabel(unpinnedParticipants);
    const shaffleByGroup = Object.values(grouped)
      .map(group => shuffleArray(group))
      .flat();

    setParticipants(shaffleByGroup);
  }, [participants, setParticipants]);

  const timeout = useRef<TimeoutId | null>(null);
  const copyToClipboard = () => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
    }

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
            setTimeout(() => setShowSendingTooltip(false), 800);
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
            {groups.length > 1 ? (
              <button
                title="Remove grouping"
                onClick={handleCleanGroups}
                className={`ml-2 mr-auto flex size-5 items-center rounded text-red-500 hover:text-red-700`}>
                <MdGroupRemove size={16} />
              </button>
            ) : (
              <div className="mr-8 size-5" />
            )}

            <h1 className="text-lg font-bold">Participants ({participants.filter(p => p.isVisible).length}): </h1>
            <button
              title="Select all"
              onClick={toggleSelectAll}
              disabled={isControlsDisabled}
              className={`ml-auto mr-2 flex size-5 items-center rounded hover:text-gray-300 ${isControlsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              {isSelectAllChecked ? <RiCheckboxMultipleLine size={18} /> : <RiCheckboxMultipleBlankLine size={18} />}
            </button>
            <button
              onClick={removeAllParticipants}
              className="mr-2 select-none text-red-500 hover:cursor-pointer hover:text-red-700">
              <FaRegTrashAlt size={16} />
            </button>
          </div>
          <ListSection searchTerm={searchTerm} />
        </div>
      )}
      <AddParticipantsForm isLightTheme={isLightTheme} onSubmit={handleAddParticipants} />
    </div>
  );
};

export default withErrorBoundary(withSuspense(MainContent, <div>Loading...</div>), <ErrorCleanStorage />);
