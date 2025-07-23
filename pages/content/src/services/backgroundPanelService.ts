import { SelectorService } from './selectorsService';
import { ParticipantService } from './participantService';
import { triggerClick } from '../utils/other';

export class BackgroundPanelService {
  private static isSetupComplete = false;
  private static setupPromise: Promise<boolean> | null = null;

  static async ensurePanelsReady(): Promise<boolean> {
    // First check if participants panel is already available
    const participantsPanel = document.querySelector('[jsname="ME4pNd"]');
    if (participantsPanel && (participantsPanel as HTMLElement).offsetHeight > 0) {
      this.isSetupComplete = true;
      return true;
    }

    if (this.isSetupComplete) {
      this.isSetupComplete = false;
    }

    if (this.setupPromise) {
      return this.setupPromise;
    }

    this.setupPromise = this.setupPanelsInBackground();
    const result = await this.setupPromise;

    if (result) {
      this.isSetupComplete = true;
    } else {
      this.setupPromise = null; // Reset so we can try again
    }

    return result;
  }

  private static async setupPanelsInBackground(): Promise<boolean> {
    try {
      // Setup panels silently
      const success = await this.openPanelsSilently();

      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private static async openPanelsSilently(): Promise<boolean> {
    try {
      await SelectorService.init();
      const selectors = SelectorService.getAllSelectors();

      const morePeople = document.querySelector(selectors.OPEN_MORE_PEOPLE_BUTTON);
      const chatPanel = document.querySelector(selectors.OPEN_CHAT_BUTTON);
      const presentPanel = document.querySelector(selectors.CHAT_INPUT);

      // If panels are already open and participants are loaded, we're done
      if (presentPanel) {
        const participants = ParticipantService.getParticipants();
        if (participants.length > 0) {
          return true;
        }
      }

      if (!morePeople || !chatPanel) {
        return false;
      }

      // Step 1: Open participants panel
      await triggerClick(morePeople);

      // Wait for participants panel to appear in DOM
      const panelAppeared = await this.waitForParticipantsPanel();
      if (!panelAppeared) {
        return false;
      }

      // Wait for participants to load within the panel
      const participantsReady = await this.waitForParticipantsToLoad();
      if (!participantsReady) {
        return false;
      }

      // Step 2: Open chat panel (keep participants open)
      await new Promise(resolve => setTimeout(resolve, 1000));
      await triggerClick(chatPanel);

      // Wait for chat panel to appear
      await this.waitForChatPanel(selectors);

      return true;
    } catch (error) {
      return false;
    }
  }

  private static async waitForParticipantsPanel(): Promise<boolean> {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const participantsPanel = document.querySelector('[jsname="ME4pNd"]') as HTMLElement;
      if (participantsPanel && participantsPanel.offsetHeight > 0) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return false;
  }

  private static async waitForParticipantsToLoad(): Promise<boolean> {
    const maxWait = 20000; // 20 seconds
    const startTime = Date.now();
    let lastCount = 0;
    let stableChecks = 0;

    while (Date.now() - startTime < maxWait) {
      // Check if participants panel is visible
      const participantsPanel = document.querySelector('[jsname="ME4pNd"]') as HTMLElement;
      if (!participantsPanel || participantsPanel.offsetHeight === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // Check for actual participant elements inside the panel
      const participantElements = participantsPanel.querySelectorAll(
        '[role="listitem"][aria-label][data-participant-id]',
      );
      const currentCount = participantElements.length;

      if (currentCount > 0) {
        if (currentCount === lastCount) {
          stableChecks++;
          if (stableChecks >= 3) {
            return true;
          }
        } else {
          stableChecks = 0;
        }
        lastCount = currentCount;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  private static async waitForChatPanel(selectors: { CHAT_INPUT: string }): Promise<boolean> {
    const maxWait = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const chatInput = document.querySelector(selectors.CHAT_INPUT);
      if (chatInput) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return false;
  }

  static getParticipantCount(): number {
    return ParticipantService.getParticipants().length;
  }

  static reset(): void {
    this.isSetupComplete = false;
    this.setupPromise = null;
  }
}
