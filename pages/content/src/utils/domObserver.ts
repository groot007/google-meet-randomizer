import { SelectorService } from '@src/services/selectorsService';
import { ParticipantService } from '../services/participantService';
import { triggerClick, waitForElement } from './other';
import type { Selectors } from '@extension/shared';

export class DOMObserver {
  private static observer: MutationObserver | null = null;
  private static timeout: NodeJS.Timeout | null = null;
  private static selectors: Selectors;

  static async init() {
    await SelectorService.init();
    this.selectors = SelectorService.getAllSelectors();
    console.log('SELELCTORSSS', this.selectors);
    const targetNode = await waitForElement(this.selectors.PARTICIPANTS_NUMBER);
    await this.setupPanels();
    this.observeChanges(targetNode);
  }

  private static async setupPanels() {
    const morePeople = document.querySelector(this.selectors.OPEN_MORE_PEOPLE_BUTTON);
    const chatPanel = document.querySelector(this.selectors.OPEN_CHAT_BUTTON);
    const presentPanel = document.querySelector(this.selectors.CHAT_INPUT);

    if (presentPanel) return;

    try {
      await triggerClick(morePeople);
      await setTimeout(() => {
        triggerClick(chatPanel);
      }, 1000);
    } catch (error) {
      console.error('Failed to setup panels:', error);
    }
  }

  private static observeChanges(targetNode: Element) {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
          if (this.timeout) clearTimeout(this.timeout);
          this.timeout = setTimeout(this.updateParticipants, 1000);
        }
      });
    });

    this.observer.observe(targetNode, { characterData: true, subtree: true });
  }

  private static updateParticipants() {
    const participants = ParticipantService.getParticipants();
    chrome.runtime.sendMessage({ action: 'updateParticipants', participants });
  }

  static cleanup(): void {
    try {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    } catch (error) {
      console.error('Failed to cleanup DOMObserver:', error);
    }
  }
}
