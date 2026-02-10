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
    const targetNode = await waitForElement(this.selectors.PARTICIPANTS_NUMBER);
    await this.setupPanels();
    this.observeChanges(targetNode);
  }

  private static async setupPanels() {
    console.groupCollapsed('🔧 [DOMObserver] Setup Panels');
    console.log('Starting setupPanels...');
    console.log('Current selectors:', this.selectors);

    // Check if elements exist
    const morePeople = document.querySelector(this.selectors.OPEN_MORE_PEOPLE_BUTTON);
    const chatPanel = document.querySelector(this.selectors.OPEN_CHAT_BUTTON);
    const presentPanel = document.querySelector(this.selectors.CHAT_INPUT);

    // Check participants panel readiness
    const participantsPanel = document.querySelector('[jsname="ME4pNd"]');
    const participantElements = participantsPanel
      ? participantsPanel.querySelectorAll('[aria-label][data-participant-id]')
      : [];
    const participantsPanelReady =
      participantsPanel && (participantsPanel as HTMLElement).offsetHeight > 0 && participantElements.length > 0;

    console.log('Element search results:');
    console.log('  📋 More People Button:', {
      selector: this.selectors.OPEN_MORE_PEOPLE_BUTTON,
      found: !!morePeople,
      element: morePeople,
      isVisible: morePeople
        ? (morePeople as HTMLElement).offsetWidth > 0 && (morePeople as HTMLElement).offsetHeight > 0
        : false,
      isEnabled: morePeople ? !(morePeople as HTMLElement).hasAttribute('disabled') : false,
    });

    console.log('  💬 Chat Panel Button:', {
      selector: this.selectors.OPEN_CHAT_BUTTON,
      found: !!chatPanel,
      element: chatPanel,
      isVisible: chatPanel
        ? (chatPanel as HTMLElement).offsetWidth > 0 && (chatPanel as HTMLElement).offsetHeight > 0
        : false,
      isEnabled: chatPanel ? !(chatPanel as HTMLElement).hasAttribute('disabled') : false,
    });

    console.log('  ✏️ Chat Input (Present Panel):', {
      selector: this.selectors.CHAT_INPUT,
      found: !!presentPanel,
      element: presentPanel,
      isVisible: presentPanel
        ? (presentPanel as HTMLElement).offsetWidth > 0 && (presentPanel as HTMLElement).offsetHeight > 0
        : false,
    });

    console.log('  👥 Participants Panel:', {
      found: !!participantsPanel,
      isVisible: participantsPanel ? (participantsPanel as HTMLElement).offsetHeight > 0 : false,
      participantCount: participantElements.length,
      isReady: participantsPanelReady,
    });

    // Check if both panels are ready
    const bothPanelsReady = presentPanel && participantsPanelReady;

    if (bothPanelsReady) {
      console.log('✅ Both chat and participants panels are ready, skipping setup');
      this.updateParticipants();
      console.groupEnd();
      return;
    }

    console.log('🚀 Panels need setup:', {
      chatInputExists: !!presentPanel,
      chatInputVisible: presentPanel
        ? (presentPanel as HTMLElement).offsetWidth > 0 && (presentPanel as HTMLElement).offsetHeight > 0
        : false,
      participantsPanelReady: participantsPanelReady,
    });

    if (!morePeople) {
      console.error('❌ More People button not found! Selector:', this.selectors.OPEN_MORE_PEOPLE_BUTTON);
      console.groupEnd();
      return;
    }

    if (!chatPanel) {
      console.error('❌ Chat Panel button not found! Selector:', this.selectors.OPEN_CHAT_BUTTON);
      console.groupEnd();
      return;
    }

    try {
      // Step 1: Setup participants panel if needed
      if (!participantsPanelReady) {
        console.log('🚀 Attempting to click More People button...');

        // Check participants panel before clicking
        const participantsPanelBefore = document.querySelector('[jsname="ME4pNd"]');
        console.log('📊 Participants panel before click:', {
          exists: !!participantsPanelBefore,
          isVisible: participantsPanelBefore
            ? (participantsPanelBefore as HTMLElement).offsetWidth > 0 &&
              (participantsPanelBefore as HTMLElement).offsetHeight > 0
            : false,
        });

        console.log("More People button element before click:", morePeople);
        await triggerClick(morePeople);
        console.log('✅ More People button clicked');

        // Wait a bit and check if participants panel appeared
        await new Promise(resolve => setTimeout(resolve, 1000));
        const participantsPanelAfter = document.querySelector('[jsname="ME4pNd"]');
        console.log('📊 Participants panel after click:', {
          exists: !!participantsPanelAfter,
          isVisible: participantsPanelAfter
            ? (participantsPanelAfter as HTMLElement).offsetWidth > 0 &&
              (participantsPanelAfter as HTMLElement).offsetHeight > 0
            : false,
        });

        // Check for actual participants
        if (participantsPanelAfter) {
          const participantElements = participantsPanelAfter.querySelectorAll('[aria-label][data-participant-id]');
          console.log('👥 Found participant elements:', participantElements.length);

          if (participantElements.length > 0) {
            console.log(
              '👥 Sample participants:',
              Array.from(participantElements)
                .slice(0, 3)
                .map(el => ({
                  ariaLabel: el.getAttribute('aria-label'),
                  participantId: el.getAttribute('data-participant-id'),
                  tagName: el.tagName,
                  className: el.className,
                })),
            );
          }
        }
      } else {
        console.log('✅ Participants panel already ready, skipping More People click');
      }

      // Step 2: Setup chat panel if needed
      const chatInputAfterParticipants = document.querySelector(this.selectors.CHAT_INPUT);
      const needsChatSetup = !chatInputAfterParticipants;

      if (needsChatSetup) {
        console.log('🚀 Waiting 1 second before clicking Chat Panel...');
        // await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🚀 Attempting to click Chat Panel button...');

        // Check chat input before clicking
        const chatInputBefore = document.querySelector(this.selectors.CHAT_INPUT);
        console.log('💬 Chat input before click:', {
          exists: !!chatInputBefore,
          isVisible: chatInputBefore
            ? (chatInputBefore as HTMLElement).offsetWidth > 0 && (chatInputBefore as HTMLElement).offsetHeight > 0
            : false,
        });

        await triggerClick(chatPanel);
        console.log('✅ Chat Panel button clicked');

        // Wait a bit and check if chat input appeared
        await new Promise(resolve => setTimeout(resolve, 500));
        const chatInputAfter = document.querySelector(this.selectors.CHAT_INPUT);
        console.log('💬 Chat input after click:', {
          exists: !!chatInputAfter,
          isVisible: chatInputAfter
            ? (chatInputAfter as HTMLElement).offsetWidth > 0 && (chatInputAfter as HTMLElement).offsetHeight > 0
            : false,
        });
      } else {
        console.log('✅ Chat panel already ready, skipping Chat Panel click');
      }

      console.log('✅ setupPanels completed successfully');
    } catch (error) {
      console.error('❌ Failed to setup panels:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    }
    this.updateParticipants();
    console.groupEnd();
  }

  private static observeChanges(targetNode: Element) {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
          if (this.timeout) clearTimeout(this.timeout);
          this.timeout = setTimeout(this.updateParticipants, 100);
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
