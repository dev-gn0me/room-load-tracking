// db_functions.js
const db = require('./connection.js');
const dbEventEmitter = require('./events.js');

// Benutzer in einem Raum einloggen
async function assignRoom(card_id_hash, room_id) {
    try {
        const [rows] = await db.query('SELECT room_id FROM roomuser WHERE card_id_hash = ?', [card_id_hash]);

        const oldRoomId = rows.length > 0 ? rows[0].room_id : null;

        await db.query('UPDATE roomuser SET room_id = ? WHERE card_id_hash = ?', [room_id, card_id_hash]);
        
        // Sende Event mit passendem Status
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'login-valid', 2000);

        // Wenn benutzer in einem anderen Raum ist -> Event zu dem alten Raum senden
        if (oldRoomId) {
            dbEventEmitter.emit('roomStatusChanged', oldRoomId);
        }
    } catch (error) {
        console.log(error);
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'login-invalid', 2000);

        if (oldRoomId) {
            dbEventEmitter.emit('roomStatusChanged', oldRoomId);
        }
    }
}

// Benutzer aus einem Raum ausloggen
async function leaveRoom(card_id_hash) {
    try {
        const [rows] = await db.query('SELECT room_id FROM roomuser WHERE card_id_hash = ?', [card_id_hash]);
        await db.query('UPDATE roomuser SET room_id = NULL WHERE card_id_hash = ?', [card_id_hash]);
        if (rows.length > 0) {
            dbEventEmitter.emit('roomStatusChanged', rows[0].room_id, true, 'logout-valid', 2000);
        }
    } catch (error) {
        console.log(error);
        if(rows && rows.length > 0) {
            dbEventEmitter.emit('roomStatusChanged', rows[0].room_id, true, 'logout-invalid', 2000);
        }
    }
}

// Raum leeren und beanspruchen
async function clearAndClaimRoom(room_id, card_id_hash) {
    try {
        await db.query('UPDATE roomuser SET room_id = NULL WHERE room_id = ?', [room_id]);
        await db.query('UPDATE roomuser SET room_id = ? WHERE card_id_hash = ?', [room_id, card_id_hash]);
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'event-claim-valid', 2000);
    } catch (error) {
        console.log(error);
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'event-claim-invalid', 2000);
    }
}

// Prüfe ob Benutzer ein Mitrbeiter ist
async function checkStaff(card_id_hash) {
    const [rows] = await db.query('SELECT staff FROM user WHERE card_id_hash = ?', [card_id_hash]);
    return rows.length > 0 && rows[0].staff == 1;
}

// Prüfe ob Benutzer in dem aktuellen Raum ist
async function userInRoom(card_id_hash, room_id) {
    const [rows] = await db.query('SELECT * FROM roomuser WHERE card_id_hash = ? AND room_id = ?', [card_id_hash, room_id]);
    return rows.length > 0;
}

// Prüfe ob Benutzer registriert ist
async function checkHashRegistered(card_id_hash) {
    const [rows] = await db.query('SELECT card_id_hash FROM user WHERE card_id_hash = ?', [card_id_hash]);
    return rows.length > 0;
}

// Registriere neue card_id_hash als default staff = 0 in user and roomuser with room_id=0
// TODO: register-valid/invalid in JSON einfügen
async function registerHashDefault(card_id_hash, room_id){
    try {
        await db.query('INSERT INTO user (card_id_hash, staff) VALUES (?, 0)', [card_id_hash]);
        await db.query('INSERT INTO roomuser (card_id_hash, room_id) VALUES (?, NULL)', [card_id_hash]);
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'register-valid', 500);
    } catch (error) {
        console.log(error);
        dbEventEmitter.emit('roomStatusChanged', room_id, true, 'register-invalid', 500);
    }
}

// Prüfe ob Staff im Raum ist
async function checkStaffInRoom(room_id) {
    const [rows] = await db.query(`
        SELECT user.staff 
        FROM roomuser 
        JOIN user ON roomuser.card_id_hash = user.card_id_hash 
        WHERE roomuser.room_id = ? AND user.staff = 1`, [room_id]
    );
    return rows.length > 0;
}

module.exports = {
    assignRoom,
    leaveRoom,
    clearAndClaimRoom,
    checkStaff,
    checkHashRegistered,
    userInRoom,
    registerHashDefault,
    checkStaffInRoom
};
