// Abhängigkeiten
// TODO SSL HANDSHAKE
const WebSocket = require('ws');
const db = require('./connection.js');
const dbEventEmitter = require('./events.js');
const httpServer = require('./httpServer.js');
const controlFlow = require('./controlFlow.js');
const checkStaffInRoom = require('./db_functions.js').checkStaffInRoom;

// Erstelle Websocket Server ohne HTTP Server
const wss = new WebSocket.Server({ noServer: true });

let connections = {
    TERMINAL: {},
    LIST: []
};

// HTTP Upgrade Requests behandeln
httpServer.on('upgrade', function (request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});

// Verwalten von WebSocketverbindungen
wss.on('connection', (ws) => {
    let roomId, roomNumber, capacity, staffInRoom, clientType;

    ws.on('message', async (message) => {
        let scannerData = JSON.parse(message);
        clientType = scannerData.clientType;
        let room_number = scannerData.roomNumber;

                if(scannerData.card_id_hash && scannerData.room_id) {
            // Übergabe an ControlFlow
            await controlFlow.handleCardSwipe(scannerData.card_id_hash, scannerData.room_id);
        }

        // Client Types LIST und Terminal behandeln und entsprechend Daten/Verhalten zuordnen
        if(clientType === 'LIST') {
            connections.LIST.push(ws);
            const [rooms] = await db.query(`SELECT room_id, room_number, capacity FROM room`);

            for(let roomData of rooms) {
                roomId = roomData.room_id;
                roomNumber = roomData.room_number;
                capacity = roomData.capacity;

                const [[userData]] = await db.query(`SELECT COUNT(*) as count FROM roomuser WHERE room_id = ?`, [roomId]);
                const currentUsers = userData.count;
                staffInRoom = await checkStaffInRoom(roomId);

                ws.send(JSON.stringify({
                    room_id: roomId,
                    roomNumber: roomNumber,
                    capacity: capacity,
                    currentUsers: currentUsers,
                    staffInRoom: staffInRoom
                }));
            }
        } else {
            
            const [[roomData]] = await db.query(`SELECT room_id, room_number, capacity FROM room WHERE room_number = ?`, [room_number]);

            if (!roomData) {
                console.error(`No data found for room with number ${room_number}`);
                return;  // Wenn roomData nicht gefunden skippe restlichen Handler
            }

            roomId = roomData.room_id;
            roomNumber = roomData.room_number;
            capacity = roomData.capacity;
            connections[roomId] = ws;

            const [[userData]] = await db.query(`SELECT COUNT(*) as count FROM roomuser WHERE room_id = ?`, [roomId]);
            const currentUsers = userData.count;
            staffInRoom = await checkStaffInRoom(roomId);

            ws.send(JSON.stringify({
                room_id: roomId,
                roomNumber: roomNumber,
                capacity: capacity,
                currentUsers: currentUsers,
                staffInRoom: staffInRoom
            }));
        }
    });

    ws.on('close', function close() {
        if(clientType === 'LIST') {
            const index = connections.LIST.indexOf(ws);
            if (index > -1) {
                connections.LIST.splice(index, 1);
            }
        } else {
            delete connections[roomId];
        }
    });
});

// Ausführen 'roomStatusChanged' Event
dbEventEmitter.on('roomStatusChanged', async function(roomId, isTemp = false, tempStyle = null, tempTime = null) {
    let roomNumber, capacity, staffInRoom;

    const [[roomData]] = await db.query(`SELECT room_number, capacity FROM room WHERE room_id = ?`, [roomId]);

    if (!roomData) {
        console.error(`No data found for room with ID ${roomId}`);
        return;  // Wenn roomData nicht gefunden skippe restlichen Handler
    }

    roomNumber = roomData.room_number;
    capacity = roomData.capacity;

    const [[userData]] = await db.query(`SELECT COUNT(*) as count FROM roomuser WHERE room_id = ?`, [roomId]);
    const currentUsers = userData.count;
    staffInRoom = await checkStaffInRoom(roomId);

    const ws = connections[roomId];
    if (ws) {
        ws.send(JSON.stringify({
            room_id: roomId,
            roomNumber: roomNumber,
            capacity: capacity,
            currentUsers: currentUsers,
            staffInRoom: staffInRoom,
            isTemp: isTemp,
            tempStyle: tempStyle,
            tempTime: tempTime
        }));
    }

    // Update LIST Clients
    for(const ws of connections.LIST) {
        ws.send(JSON.stringify({ 
            room_id: roomId, 
            roomNumber: roomNumber, 
            capacity: capacity, 
            currentUsers: currentUsers, 
            staffInRoom: staffInRoom,
            isTemp: isTemp,
            tempStyle: tempStyle,
            tempTime: tempTime
        }));
    }
});
