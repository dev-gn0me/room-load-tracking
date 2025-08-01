// httpServer.js
// HTTP Routes 
// Primär für admin-panel.(html/js)
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./connection.js'); 
const controlFlow = require('./controlFlow.js');
const { assignRoom, clearAndClaimRoom, leaveRoom } = require('./db_functions.js');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const port = process.env.HTTP_PORT || 8080;
const server = app.listen(port, () => console.log(`HTTP Server läuft auf Port ${port}`));

// Definieren von HTTP-Routes
app.get('/terminal', (req, res) => {
    res.sendFile(__dirname + '/public/index-terminal.html');
  });
  
  app.get('/list', (req, res) => {
    res.sendFile(__dirname + '/public/index-list.html');
  });
  
app.post('/assign-room', async (req, res) => {
    const { cardId, roomId } = req.body;
    try {
        await assignRoom(cardId, roomId);
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign room' });
    }
});

app.post('/leave-room', async (req, res) => { 
    const { cardId } = req.body;
    try {
        await leaveRoom(cardId);
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave room' });
    }
});

app.post('/clear-and-claim-room', async (req, res) => {
    const { roomId } = req.body;
    try {
        await clearAndClaimRoom(roomId);
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear and claim room' });
    }
});

app.post('/card-swipe', async (req, res) => {
    const { cardId, roomId } = req.body;
    try {
      await controlFlow.handleCardSwipe(cardId, roomId);
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to handle card swipe' });
    }
  });

  app.post('/simulate-card-swipe', async (req, res) => {
    const { cardId, roomId } = req.body;
    try {
      await controlFlow.handleCardSwipe(cardId, roomId);
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to simulate card swipe' });
    }
  });

app.get('/rooms', async (req, res) => {
    try {
        const [rooms] = await db.query(`SELECT * FROM room`);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get rooms' });
    }
});

app.get('/roomusers', async (req, res) => {
    try {
        const [roomUsers] = await db.query(`SELECT * FROM roomuser`);
        res.json(roomUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get room users' });
    }
});

module.exports = server;
