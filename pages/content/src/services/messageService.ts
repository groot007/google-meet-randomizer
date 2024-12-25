import { isElementVisible } from '../utils/other';
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

  private static submitMessage(input: HTMLInputElement, message: string) {
    const { CHAT_SEND_BUTTON, CHAT_SEND_BUTTON_PARENT } = SelectorService.getAllSelectors();
    input.value = message;
    const sendButton = input.closest(CHAT_SEND_BUTTON_PARENT)?.querySelector(CHAT_SEND_BUTTON);

    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (sendButton && sendButton instanceof HTMLButtonElement) {
      sendButton.click();
      return { success: true };
    }
    return { success: false, error: 'Send button not found' };
  }
}
