import { isElementVisible, triggerClick, waitForElement } from './utils';

interface Selectors {
  PARTICIPANTS: string;
  CHAT_INPUT: string;
  CHAT_SEND_BUTTON: ChatSendButton;
  TEXT_CONTENT: string;
  PARTICIPANTS_NUMBER: string;
  ACTIVE_MEET: string;
  OPEN_CHAT_BUTTON: string;
}

interface ChatSendButton {
  BUTTON: string;
  PARENT: string;
}

const SELECTORS = {
  PARTICIPANTS: '[data-participant-id]',
  CHAT_INPUT: '#bfTqV',
  CHAT_SEND_BUTTON: {
    BUTTON: '.yHy1rc',
    PARENT: '.SjMC3',
  },
  TEXT_CONTENT: '[jscontroller="LxQ0Q"]',
  PARTICIPANTS_NUMBER: '.wOmdle',
  ACTIVE_MEET: '.uGOf1d',
  OPEN_CHAT_BUTTON: '[jsname="A5il2e"][data-panel-id="2"]',
  OPEN_MORE_PEOPLE_BUTTON: '[jsname="A5il2e"][data-panel-id="1"]',
};

const STORAGE_KEY = 'MEET_SELECTORS';

let MEET_SELECTORS = SELECTORS;

const initSelectors = async () => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const storedSelectors = result[STORAGE_KEY] as Partial<Selectors>;

    if (storedSelectors) {
      MEET_SELECTORS = {
        ...SELECTORS,
        ...storedSelectors,
        CHAT_SEND_BUTTON: {
          ...SELECTORS.CHAT_SEND_BUTTON,
          ...(storedSelectors.CHAT_SEND_BUTTON || {}),
        },
      };
    }
  } catch (error) {
    console.error('Failed to load selectors:', error);
  }
};

// Initialize selectors before using them
initSelectors();

function getParticipants() {
  const participantElements = document.querySelectorAll(MEET_SELECTORS.PARTICIPANTS);

  const arr = Array.from(participantElements)
    .map(el => {
      const ariaLabel = el.getAttribute('aria-label');
      const name = ariaLabel || el.querySelector(MEET_SELECTORS.TEXT_CONTENT)?.textContent || '';
      if (!name) return null;
      return { name };
    })
    .filter(Boolean);

  return [...new Set(arr)];
}

function getMeetId() {
  return new URL(window.location.href).searchParams.get('d') || 'unknown';
}

const updateParticipantsList = () => {
  const participants = getParticipants();
  chrome.runtime.sendMessage({ action: 'updateParticipants', participants });
};

const triggerButtonClicks = async () => {
  const morePeople = document.querySelector(SELECTORS.OPEN_MORE_PEOPLE_BUTTON);
  const chatPanel = document.querySelector(SELECTORS.OPEN_CHAT_BUTTON);

  try {
    await triggerClick(morePeople);
    await setTimeout(() => {
      triggerClick(chatPanel);
    }, 1000);
  } catch (error) {
    console.error('Failed to trigger clicks:', error);
  }
};

// Watch for DOM changes
const observeDOMChanges = async () => {
  const targetNode = await waitForElement(MEET_SELECTORS.ACTIVE_MEET); // Replace with the actual class or ID
  // trigger pannels open to have an access to the full participants list
  await triggerButtonClicks();

  const config = { characterData: true, subtree: true };
  const callback = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'characterData') {
        setTimeout(updateParticipantsList, 1000);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
};

observeDOMChanges();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getParticipants') {
    sendResponse({ participants: getParticipants(), meetId: getMeetId() });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToChat') {
    const chatInput = document.querySelector(MEET_SELECTORS.CHAT_INPUT) as HTMLInputElement;
    const chatPanel = document.querySelector(SELECTORS.OPEN_CHAT_BUTTON);

    if (!isElementVisible(chatInput)) {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      chatPanel?.dispatchEvent(clickEvent);
    }

    sendMessage(chatInput, request.message, sendResponse);
  }
});

function sendMessage(input: Element, message: string, sendResponse: any) {
  input.value = message;
  const sendButton = input
    .closest(MEET_SELECTORS.CHAT_SEND_BUTTON.PARENT)
    ?.querySelector(MEET_SELECTORS.CHAT_SEND_BUTTON.BUTTON);

  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);

  if (sendButton && sendButton instanceof HTMLButtonElement) {
    sendButton.click();
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Send button not found' });
  }
}
