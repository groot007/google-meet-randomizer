import { isElementVisible, waitForElement } from '../utils/other';
import { SelectorService } from './selectorsService';

export class MessageService {
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
