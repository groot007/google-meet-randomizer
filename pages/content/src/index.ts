import { DOMObserver } from './utils/domObserver';
import { MessageService } from './services/messageService';
import { ParticipantService } from './services/participantService';

// Setup message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'init':
      DOMObserver.init();
      sendResponse({ success: true, message: 'Content script initialized' });
      break;
    case 'cleanup':
      DOMObserver.cleanup();
      sendResponse({ success: true, message: 'Cleanup completed' });
      break;
    case 'getParticipants':
      sendResponse({
        participants: ParticipantService.getParticipants(),
        meetId: ParticipantService.getMeetId(),
      });
      break;
    case 'sendToChat':
      MessageService.sendMessage(request.message).then(sendResponse);
      break;
  }
  return true; // Keep channel open for async response
});
