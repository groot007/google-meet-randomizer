export const isDevMode = (): boolean => {
  const installType = chrome.runtime.getManifest().update_url ? 'production' : 'development';
  return installType === 'development';
};

export const getExtensionVersion = (): string => {
  return chrome.runtime.getManifest().version;
};
