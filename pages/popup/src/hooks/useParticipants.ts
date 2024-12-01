import { useEffect, useState } from 'react';
import { type ParticipantsListItem } from '../types';
import { loadSavedList, saveList, mergeParticipants, sortByStatus } from '../utils';

export const useParticipants = (url: string) => {
  const [participants, setParticipants] = useState<ParticipantsListItem[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const savedParticipants = await loadSavedList(url);

      if (url.includes('meet.google.com')) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const currentTab = tabs[0];
          console.log('currentTab', currentTab.id);
          if (currentTab?.id) {
            chrome.tabs.sendMessage(currentTab.id, { action: 'getParticipants' }, response => {
              if (response && response.participants) {
                let uniqueParticipants = [...new Set(response.participants)] as ParticipantsListItem[];
                uniqueParticipants = uniqueParticipants.map(p => ({
                  name: p.name,
                  included: savedParticipants.find(p2 => p2.name === p.name)?.included ?? true,
                }));
                const sorted = sortByStatus(uniqueParticipants);
                setParticipants(sorted);
                // saveList(sorted, url);
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
          let uniqueParticipants = [...new Set(updatedList)] as ParticipantsListItem[];

          uniqueParticipants = uniqueParticipants.map(p => ({
            name: p.name,
            included: savedParticipants.find(p2 => p2.name === p.name)?.included ?? true,
          }));

          const sorted = sortByStatus(uniqueParticipants);
          setParticipants(sorted);
          //   saveList(sorted, url);
        }
      }
    });
  }, [url]);

  const addParticipant = (name: string) => {
    const updatedParticipants = [...participants, { name, included: true }];
    const sorted = sortByStatus(updatedParticipants);
    setParticipants(sorted);
    saveList(sorted, url);
  };

  const toggleInclude = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].included = !updatedParticipants[index].included;
    const sorted = sortByStatus(updatedParticipants);
    setParticipants(sorted);
    saveList(sorted, url);
  };

  const deleteParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    const sorted = sortByStatus(updatedParticipants);
    setParticipants(sorted);
    saveList(sorted, url);
  };

  return {
    participants,
    setParticipants,
    addParticipant,
    toggleInclude,
    deleteParticipant,
  };
};
