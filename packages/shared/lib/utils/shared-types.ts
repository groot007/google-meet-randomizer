export type ValueOf<T> = T[keyof T];

export type Selectors = {
  PARTICIPANT_ITEM: string;
  CHAT_INPUT: string;
  CHAT_SEND_BUTTON: string;
  CHAT_SEND_BUTTON_PARENT: string;
  TEXT_CONTENT: string;
  PARTICIPANTS_NUMBER: string;
  OPEN_CHAT_BUTTON: string;
  OPEN_MORE_PEOPLE_BUTTON: string;
};

export const STORAGE_KEY = 'MEET_SELECTORS';

export const DEFAULT_SELECTORS: Selectors = {
  PARTICIPANT_ITEM: '[jsname="ME4pNd"] > * [role="listitem"][aria-label][data-participant-id]',
  CHAT_INPUT: '#bfTqV',
  CHAT_SEND_BUTTON: 'button',
  CHAT_SEND_BUTTON_PARENT: '.SjMC3',
  TEXT_CONTENT: '[jscontroller="LxQ0Q"]',
  PARTICIPANTS_NUMBER: '[jscontroller="DM9D1"]',
  OPEN_CHAT_BUTTON: '[jsname="A5il2e"][data-panel-id="2"]',
  OPEN_MORE_PEOPLE_BUTTON: '[jscontroller="N61cX"] img',
};
