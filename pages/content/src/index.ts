import { DOMObserver } from './utils/domObserver';
import { MessageService } from './services/messageService';
import { ParticipantService } from './services/participantService';
import { Drawer } from './drawer';

let ws: WebSocket;
let drawer: Drawer;

// Setup message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'init':
      DOMObserver.init();
      break;
    case 'cleanup':
      DOMObserver.cleanup();
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
    case 'toggleDrawingFeature':
      console.log('toggleDrawingFeature', request.message);
      if (request.message) {
        connectWebSocket();
      } else {
        cleanDrawingFeature();
      }
      break;
    case 'togglePencil':
      console.log('togglePencil', request.turnON);

      toggleDrawer(request.turnON);
  }
  return true; // Keep channel open for async response
});

const toggleDrawer = (turnON: boolean) => {
  const drawer = document.getElementById('shuffleMeet-canvas');
  if (!drawer) return;

  drawer.style.pointerEvents = turnON ? 'all' : 'none';
};

function cleanDrawingFeature() {
  drawer?.clean();
  ws?.close();
  console.log('WebSocket closed');
  return;
}

function connectWebSocket() {
  const roomID = window.location.pathname.split('/')[1];
  console.log('roomID', roomID);
  ws = new WebSocket('wss://go-apps-a59c09874b32.herokuapp.com/ws?room=' + roomID);

  ws.onopen = () => {
    console.log('WebSocket connected');
    drawer = new Drawer(ws);
    keepAlive();
  };

  ws.onmessage = function (evt) {
    const data = JSON.parse(evt.data);
    if (data.draw) {
      drawer.drawRemoteLine(data.draw.fromX, data.draw.fromY, data.draw.toX, data.draw.toY);
    }
  };
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(
    () => {
      if (ws) {
        ws.send(JSON.stringify('keepalive'));
      } else {
        clearInterval(keepAliveIntervalId);
      }
    },
    // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
    20 * 1000,
  );
}
