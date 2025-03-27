import { useEffect } from 'react';

export const useInitContentScript = async (currentUrl: string, shouldInit: boolean) => {
  useEffect(() => {
    if (!shouldInit) return;

    const initializeContent = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) return;

        await chrome.tabs.sendMessage(tab.id, { action: 'init' }, response => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send message:', chrome.runtime.lastError.message);
          } else {
            console.log('Response from content script:', response);
          }
        });
      } catch (error) {
        console.error('Failed to initialize content:', error);
      }
    };

    const cleanup = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) return;

        await chrome.tabs.sendMessage(tab.id, { action: 'cleanup' });
      } catch (error) {
        console.error('Failed to cleanup content:', error);
      }
    };

    initializeContent();
    return () => {
      cleanup();
    };
  }, [currentUrl, shouldInit]);
};
