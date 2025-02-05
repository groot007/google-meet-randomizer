import { useEffect, useState } from 'react';

export const useCurrentUrl = (): string => {
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentTab = tabs[0];
      if (currentTab?.url) {
        const urlWithoutParams = currentTab.url.split('?')[0];
        setCurrentUrl(urlWithoutParams);
      }
    });
  }, []);

  return currentUrl;
};
