import { isElementVisible, waitForElement } from '../utils/other';
import { SelectorService } from './selectorsService';
import { ParticipantService } from './participantService';

interface MessageRequest {
  action: string;
  message?: string;
}

export class MessageService {
  static handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): boolean | void {
    try {
      switch (request.action) {
        case 'getParticipants': {
          if (ParticipantService.isParticipantsPanelAvailable()) {
            const participants = ParticipantService.getParticipants();
            sendResponse({ participants });
          } else {
            sendResponse({
              participants: [],
              error: 'Participants panel not available. Please open the participants list manually from Google Meet.',
            });
          }
          break;
        }

        case 'sendMessage':
        case 'sendToChat': {
          if (!request.message) {
            sendResponse({ success: false, error: 'Message is required' });
            break;
          }

          this.sendMessage(request.message)
            .then(result => {
              sendResponse(result);
            })
            .catch(error => {
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            });
          return true; // Indicates async response
        }

        case 'init': {
          sendResponse({
            success: true,
            message: 'Content script already initialized',
            participantCount: ParticipantService.getParticipants().length,
            panelAvailable: ParticipantService.isParticipantsPanelAvailable(),
          });
          break;
        }

        case 'cleanup': {
          // DOMObserver cleanup would be called here if available
          sendResponse({ success: true, message: 'Cleanup completed' });
          break;
        }

        case 'checkPanels':
        case 'diagnostic': {
          const panelAvailable = ParticipantService.isParticipantsPanelAvailable();
          const selectors = SelectorService.getAllSelectors();
          const panelStructure = ParticipantService.debugPanelStructure();
          sendResponse({
            success: true,
            panelAvailable: panelAvailable,
            selectors: selectors,
            panelStructure: panelStructure,
            participantCount: panelAvailable ? ParticipantService.getParticipants().length : 0,
          });
          break;
        }

        default: {
          const availableActions = [
            'getParticipants',
            'sendMessage',
            'sendToChat',
            'init',
            'cleanup',
            'checkPanels',
            'diagnostic',
          ];
          sendResponse({
            success: false,
            error: `Unknown action: ${request.action}`,
            availableActions: availableActions,
          });
          break;
        }
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return false; // Sync response
  }

  static async sendMessage(message: string) {
    const { CHAT_INPUT, OPEN_CHAT_BUTTON } = SelectorService.getAllSelectors();
    const chatInput = document.querySelector(CHAT_INPUT) as HTMLInputElement;
    const chatPanel = document.querySelector(OPEN_CHAT_BUTTON);

    if (!isElementVisible(chatInput)) {
      await this.openChat(chatPanel);
    }
    return this.submitMessage(chatInput, message);
  }

  private static async openChat(chatPanel: Element | null) {
    if (!chatPanel) return;

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    chatPanel.dispatchEvent(clickEvent);
  }

  private static async submitMessage(input: HTMLInputElement, message: string) {
    const { CHAT_SEND_BUTTON, CHAT_SEND_BUTTON_PARENT } = SelectorService.getAllSelectors();
    input.value = message;
    const sendButton = input.closest(CHAT_SEND_BUTTON_PARENT)?.querySelector(CHAT_SEND_BUTTON);

    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (!sendButton) {
      return { success: false, error: 'Send button not found' };
    }

    // Wait until the button becomes enabled or visible
    await this.waitForButtonEnabled(sendButton);

    sendButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { success: true };
  }

  private static async waitForButtonEnabled(button: Element): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if the button is already enabled
      if (!button.hasAttribute('disabled')) {
        resolve();
        return;
      }

      // Use MutationObserver to wait for the button to become enabled
      const observer = new MutationObserver(() => {
        if (!button.hasAttribute('disabled')) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });

      // Optional: Timeout after 10 seconds if the button does not become enabled
      setTimeout(() => {
        observer.disconnect();
        reject(new Error('Button did not become enabled within timeout period'));
      }, 10000);
    });
  }
}
