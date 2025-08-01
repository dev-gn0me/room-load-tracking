// socket.js
import * as ui from './frontend/ui.js';
export function initializeWebSocket(roomNumber, clientType) {
    const ws = new WebSocket(window.env.WS_URL);
  
    ws.onopen = function () {
      ws.send(
        JSON.stringify({
          roomNumber: roomNumber,
          clientType: clientType,
        })
      );
    };
    
    return ws;
  }

export function initializeCardWebSocket(ws) {
  const cardWs = new WebSocket(window.env.CARD_WS_URL);

  cardWs.onmessage = function (event) {
    const cardData = JSON.parse(event.data);
    const room_id = sessionStorage.getItem("room_id");

    ws.send(
      JSON.stringify({
        card_id_hash: cardData.card_id_hash,
        room_id: room_id,
      })
    );
  };

  return cardWs;
}

export function fetchConfig() {
    return fetch(`${window.env.API_URL}/config`)
      .then((response) => response.json());
 }

 export function sendWebSocketMessage(ws, message) {
    ws.send(JSON.stringify(message));
  }
  
export function handleCardWebSocketMessage(ws, event) {
  const cardData = JSON.parse(event.data);
  const room_id = sessionStorage.getItem("room_id");

  sendWebSocketMessage(ws, { card_id_hash: cardData.card_id_hash, room_id });
}

export function handleWebSocketMessage(ws, clientType, event) {
  if (!event.data) {
    console.warn('Received undefined message');
    return;
  }

  const data = JSON.parse(event.data);

  if (clientType === "LIST") {
    ui.handleListClientMessage(data);
  } else {
    ui.handleTerminalClientMessage(data);
  }
}

/*export const socketFunctions = {
  fetchConfig,
  sendWebSocketMessage,
  handleCardWebSocketMessage,
  handleWebSocketMessage,
  initializeCardWebSocket,
  initializeWebSocket
};*/


