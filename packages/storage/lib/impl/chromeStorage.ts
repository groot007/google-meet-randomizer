import type { StateStorage } from 'zustand/middleware';

export const chromeStorage: StateStorage = {
  getItem: async name => {
    return new Promise(resolve => {
      chrome.storage.local.get([name], result => {
        resolve(result[name] ? JSON.parse(result[name]) : null);
      });
    });
  },
  setItem: async (name, value) => {
    return new Promise(resolve => {
      chrome.storage.local.set({ [name]: JSON.stringify(value) }, () => {
        resolve(true);
      });
    });
  },
  removeItem: async name => {
    return new Promise(resolve => {
      chrome.storage.local.remove([name], () => {
        resolve(true);
      });
    });
  },
};
