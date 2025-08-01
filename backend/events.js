// events.js
// Benutzerdefinierter Event-Emitter für Datenbankbezogene interaktionen
const EventEmitter = require('events');

class DbEventEmitter extends EventEmitter {}

const dbEventEmitter = new DbEventEmitter();

module.exports = dbEventEmitter;
