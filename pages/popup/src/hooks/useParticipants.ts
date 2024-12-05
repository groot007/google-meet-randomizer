import { useEffect, useState } from 'react';
import { type ParticipantsListItem } from '../types';
import { loadSavedList, saveList, sortByStatus, generateUniqueId, mergeParticipants } from '../utils';

export const useParticipants = (url: string) => {
  const [participants, setParticipants] = useState<ParticipantsListItem[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      const savedParticipants = await loadSavedList(url);

      if (url.includes('meet.google.com')) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const currentTab = tabs[0];
          if (currentTab?.id) {
            chrome.tabs.sendMessage(currentTab.id, { action: 'getParticipants' }, response => {
              if (response && response.participants) {
                if (response && response.participants) {
                  const uniqueParticipants = [...new Set(response.participants)] as ParticipantsListItem[];
                  const mergedLists = mergeParticipants(uniqueParticipants, savedParticipants);
                  const sorted = sortByStatus(mergedLists);
                  setParticipants(sorted);
                  saveList(sorted, url);
                }
              }
            });
          }
        });
      } else {
        setParticipants(savedParticipants);
      }
    };

    fetchParticipants();
  }, [url]);

  useEffect(() => {
    if (!url.includes('meet.google.com')) return;

    chrome.runtime.onMessage.addListener(async request => {
      if (request.action === 'updateParticipants') {
        const updatedList = request.participants;

        if (updatedList) {
          const savedParticipants = await loadSavedList(url);
          console.log('updatedList', updatedList);
          updatedList.filter(p => p.name !== '');
          let uniqueParticipants = [...new Set(updatedList)] as ParticipantsListItem[];

          uniqueParticipants = uniqueParticipants.map(p => ({
            id: generateUniqueId(),
            name: p.name,
            included: savedParticipants.find(p2 => p2.name === p.name)?.included ?? true,
            pinnedTop: savedParticipants.find(p2 => p2.name === p.name)?.pinnedTop ?? false,
            pinnedBottom: savedParticipants.find(p2 => p2.name === p.name)?.pinnedBottom ?? false,
          }));

          const sorted = sortByStatus(uniqueParticipants);
          setParticipants(sorted);
          //   saveList(sorted, url);
        }
      }
    });
  }, [url]);

  useEffect(() => {
    // Check if all participants are selected on initial load
    const allSelected = participants.every(p => p.included);
    setSelectAllChecked(allSelected);
  }, [participants, setSelectAllChecked]);

  const addParticipants = (newParticipants: ParticipantsListItem[]) => {
    const updatedParticipants = [...participants, ...newParticipants];
    const sorted = sortByStatus(updatedParticipants);
    console.log('SOOO ', sorted);
    setParticipants(sorted);
    saveList(sorted, url);
  };

  const toggleInclude = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].included = !updatedParticipants[index].included;
    const sorted = sortByStatus(updatedParticipants);

    setParticipants(sorted);
    saveList(sorted, url);

    const allSelected = updatedParticipants.every(p => p.included);
    setSelectAllChecked(allSelected);
  };

  const deleteParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    const sorted = sortByStatus(updatedParticipants);
    setParticipants(sorted);
    saveList(sorted, url);
  };

  const togglePinTop = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].pinnedTop = !updatedParticipants[index].pinnedTop;
    updatedParticipants[index].pinnedBottom = false;

    // Move pinned participants to the top
    const sortedParticipants = sortByStatus(updatedParticipants);

    setParticipants(sortedParticipants);
    saveList(sortedParticipants, url);
  };

  const togglePinBottom = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].pinnedBottom = !updatedParticipants[index].pinnedBottom;
    updatedParticipants[index].pinnedTop = false;

    // Move pinned participants to the bottom
    const sortedParticipants = sortByStatus(updatedParticipants);

    setParticipants(sortedParticipants);
    saveList(sortedParticipants, url);
  };

  const toggleSelectAll = () => {
    const updatedParticipants = participants.map(p => ({ ...p, included: !selectAllChecked }));
    setParticipants(updatedParticipants);
    saveList(updatedParticipants, url);
    setSelectAllChecked(!selectAllChecked);
  };

  return {
    participants,
    setParticipants,
    addParticipants,
    toggleInclude,
    deleteParticipant,
    selectAllChecked,
    setSelectAllChecked,
    toggleSelectAll,
    togglePinTop,
    togglePinBottom,
  };
};
