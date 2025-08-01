// client.js
import * as socket from './sockets.js';

window.addEventListener("load", function () {
  socket.fetchConfig()
    .then((data) => {
      const roomNumber = data.roomNumber;
      const clientType = data.clientType;

      const ws = socket.initializeWebSocket(roomNumber, clientType);

      if (clientType === "TERMINAL") {
        const cardWs = socket.initializeCardWebSocket(ws);
      }

      ws.onmessage = socket.handleWebSocketMessage.bind(null, ws, clientType);
    });
});
