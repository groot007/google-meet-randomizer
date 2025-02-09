import { SelectorService } from './selectorsService';

export class ParticipantService {
  static getParticipants() {
    const { PARTICIPANT_ITEM, TEXT_CONTENT } = SelectorService.getAllSelectors();
    const participantElements = document.querySelectorAll(PARTICIPANT_ITEM);

    const participants = Array.from(participantElements)
      .map(el => {
        const ariaLabel = el.getAttribute('aria-label');
        const name = ariaLabel || el.querySelector(TEXT_CONTENT)?.textContent || '';
        return name ? { name } : null;
      })
      .filter(Boolean);

    return Array.from(new Map(participants.map(p => [p.name, p])).values());
  }

  static getMeetId() {
    return new URL(window.location.href).searchParams.get('d') || 'unknown';
  }
}
