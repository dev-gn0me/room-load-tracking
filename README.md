# room-load-tracking
Tracking application to keep track on how full a room is. Using a client server architecture and rfid terminals on each room. (Training project)

## Used technologies

### Frontend
Shows an overview of all rooms and their current room load.
* HTML
* Javascript

### Backend
Websocket setup to update all RFID-Terminals and Frontend Overview of all rooms in real time. 
* Node.js
* Express
* Websockets

### Database
Stores user IDs, permissions and current room where a user is logged in
* PHPMyAdmin (MySQL)

### RFID Terminal
RFID-Terminals with a display will show the room ID, room load and current room usage with dynamic style changes.
User are able to login into the room by holding their RFID card to the related display zone.
* Python
* Flask
