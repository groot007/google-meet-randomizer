import { waitForElement } from './utils';

function getParticipants() {
  // const tooManyParticipants = document.querySelector('.wOmdle');
  const participantElements = document.querySelectorAll('[data-participant-id]');

  // if (tooManyParticipants) {
  //   chrome.runtime.sendMessage({ action: 'tooManyParticipants' });
  //   participantElements = document.querySelectorAll('[data-participant-id]');
  // }
  const arr = Array.from(participantElements)
    .map(el => {
      const ariaLabel = el.getAttribute('aria-label');
      const name = ariaLabel || el.querySelector('[jscontroller="LxQ0Q"]')?.textContent || '';
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

// Watch for DOM changes
const observeDOMChanges = async () => {
  const targetNode = await waitForElement('.uGOf1d'); // Replace with the actual class or ID

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
    const chatInput = document.getElementById('bfTqV') as HTMLInputElement;

    if (!chatInput) {
      const openChatButton = document.querySelector('[jscontroller="S5EFRd"] [jsname="A5il2e"]') as HTMLButtonElement;
      if (!openChatButton) {
        console.error('Open chat button not found');
        sendResponse({ success: false, error: 'Open chat button not found' });
        return;
      }
      openChatButton.click();
      // Wait for chatInput to be available
      waitForElement('#bfTqV')
        .then(chatInputElement => {
          console.log('sendButton', 2);
          const chatInput = chatInputElement as HTMLInputElement;
          chatInput.value = request.message;
          const sendButton = chatInput.closest('.SjMC3')?.querySelector('.yHy1rc');

          const event = new Event('input', { bubbles: true });
          chatInput.dispatchEvent(event);

          if (sendButton && sendButton instanceof HTMLButtonElement) {
            setTimeout(() => {
              sendButton.click();
            }, 1000);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Send button not found' });
          }
        })
        .catch(error => {
          console.error('Chat input not found after opening chat:', error);
          sendResponse({ success: false, error: 'Chat input not found after opening chat' });
        });
    } else {
      chatInput.value = request.message;
      const sendButton = chatInput.closest('.SjMC3')?.querySelector('.yHy1rc');

      const event = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(event);

      if (sendButton && sendButton instanceof HTMLButtonElement) {
        sendButton.click();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Send button not found' });
      }
    }

    sendResponse({ success: true });
  }
});
