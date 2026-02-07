import { SelectorService } from './selectorsService';

export class ParticipantService {
  static getParticipants() {
    const { TEXT_CONTENT } = SelectorService.getAllSelectors();

    // CRITICAL CHECK: Ensure the participants panel exists
    const participantsPanel = document.querySelector('[jsname="ME4pNd"]');
    if (!participantsPanel) {
      return [];
    }

    // Instead of using the complex selector, search within the participants panel only
    // and use the most reliable attributes we found in the logs
    const participantElements = participantsPanel.querySelectorAll(
      '[role="listitem"][aria-label][data-participant-id]',
    );

    // Try fallback selector if the original doesn't work
    let elementsToProcess = participantElements;
    if (participantElements.length === 0) {
      elementsToProcess = participantsPanel.querySelectorAll('[aria-label][data-participant-id]');
    }

    const participants = Array.from(elementsToProcess)
      .map(el => {
        const ariaLabel = el.getAttribute('aria-label');
        const textContentElement = el.querySelector(TEXT_CONTENT);
        const textContent = textContentElement?.textContent || '';
        const name = ariaLabel || textContent || '';

        return name ? { name } : null;
      })
      .filter(Boolean);

    const uniqueParticipants = Array.from(new Map(participants.map(p => [p!.name, p])).values());

    return uniqueParticipants;
  }

  static isParticipantsPanelAvailable(): boolean {
    const participantsPanel = document.querySelector('[jsname="ME4pNd"]');
    const isAvailable = !!participantsPanel;
    return isAvailable;
  }

  static debugPanelStructure() {
    const participantsPanel = document.querySelector('[jsname="ME4pNd"]');
    if (!participantsPanel) {
      return null;
    }

    // Check different possible selectors within the panel
    const selectors = [
      '[role="listitem"]',
      '[aria-label]',
      '[data-participant-id]',
      '[role="listitem"][aria-label]',
      '[role="listitem"][data-participant-id]',
      '[aria-label][data-participant-id]',
      '[role="listitem"][aria-label][data-participant-id]',
    ];

    const results = selectors.map(selector => {
      const elements = participantsPanel.querySelectorAll(selector);
      return {
        selector,
        count: elements.length,
        elements: Array.from(elements)
          .slice(0, 3)
          .map(el => ({
            tagName: el.tagName,
            className: el.className,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            participantId: el.getAttribute('data-participant-id'),
          })),
      };
    });

    return results;
  }

  static getMeetId() {
    return new URL(window.location.href).searchParams.get('d') || 'unknown';
  }
}
