// admin-panel.js
document.getElementById('assign-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const cardId = document.getElementById('assign-card-id').value;
  const roomId = document.getElementById('assign-room-id').value;
  
  fetch('/assign-room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cardId, roomId })
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      fetchRoomData();
  })
  .catch(error => console.error(error));
});

document.getElementById('leave-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const cardId = document.getElementById('leave-card-id').value;
  
  fetch('/leave-room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cardId })
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      fetchRoomData();
  })
  .catch(error => console.error(error));
});

document.getElementById('clear-and-claim-room-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const roomId = document.getElementById('clear-and-claim-room-id').value;
  
  fetch('/clear-and-claim-room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId })
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      fetchRoomData();
  })
  .catch(error => console.error(error));
});

document.getElementById('simulate-swipe-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const cardId = document.getElementById('simulate-card-id').value;
  const roomId = document.getElementById('simulate-room-id').value;
  
  fetch('/simulate-card-swipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cardId, roomId })
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      fetchRoomData(); 
  })
  .catch(error => console.error(error));
});

function fetchRoomData() {
  fetch('http://localhost:8080/rooms')
      .then(response => response.json())
      .then(data => {
          const roomsDiv = document.getElementById('rooms');
          roomsDiv.innerHTML = '';
          data.forEach(room => {
              roomsDiv.innerHTML += `<p>${JSON.stringify(room)}</p>`;
          });
      });

  fetch('http://localhost:8080/roomusers')
      .then(response => response.json())
      .then(data => {
          const roomUsersDiv = document.getElementById('roomusers');
          roomUsersDiv.innerHTML = '';
          data.forEach(roomUser => {
              roomUsersDiv.innerHTML += `<p>${JSON.stringify(roomUser)}</p>`;
          });
      });
}

// Fetch room data when the page loads
fetchRoomData();
