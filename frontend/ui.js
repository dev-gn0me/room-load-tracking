// ui.js
import * as sockets from './sockets.js';
export function handleListClientMessage(data) {
    // Copy everything inside the "if (clientType === "LIST")" block here
    let table = document.getElementById("roomListTable");
    let row = document.querySelector(
      `tr[data-room-number="${data.roomNumber}"]`
    );
  
    let percentage = Math.max(
      Math.min((data.currentUsers * 100) / data.capacity, 100),
      0
    );
  
    if (!row) {
      row = document.createElement("tr");
      row.setAttribute("data-room-number", data.roomNumber);
      row.innerHTML = `
        <td>${data.roomNumber}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-bar-fill"></div>
            <div class="progress-bar-overlay"></div>
          </div>
        </td>
        <td>${data.currentUsers}</td>
        <td>${data.capacity}</td>
        <td class="status"></td>
      `;
      table.appendChild(row);
    } else {
      let cells = row.querySelectorAll("td");
      cells[2].innerText = data.currentUsers;
      cells[3].innerText = data.capacity;
    }
  
    let statusCell = row.querySelector(".status");
    statusCell.style.backgroundColor = getStatusColor(data);
    statusCell.innerText = getStatusText(data);
  
    let progressBarFill = row.querySelector(".progress-bar-fill");
    let progressBarOverlay = row.querySelector(".progress-bar-overlay");
  
    if (data.staffInRoom) {
      progressBarFill.style.width = '100%';
      progressBarFill.style.background = '#5DCFE1';
      progressBarOverlay.style.width = '0%';
    } else if (data.currentUsers > data.capacity) {
      progressBarFill.style.width = '100%';
      progressBarFill.style.background = '#FF0000';
      progressBarOverlay.style.width = '0%';
    } else {
      setProgressBar(progressBarFill, percentage, progressBarOverlay, 100 - percentage);
    }
  }

export function handleTerminalClientMessage(data) {
  // Copy everything inside the "else" block here
  if (data.room_id) {
    sessionStorage.setItem("room_id", data.room_id);

    document.getElementById("roomNumberDisplay").innerText = `${data.roomNumber}`;
    document.getElementById("capacityDisplay").innerText = `${data.capacity}`;
    document.getElementById("currentUsersDisplay").innerText = `${data.currentUsers}`;

    let percentage = Math.floor((data.currentUsers * 100) / data.capacity);
    document.getElementById("percentageBox").style.setProperty("--value", `${percentage}`);

    applyConstStyle(data.currentUsers, data.capacity, data.status, data.staffInRoom);

    if (data.isTemp) {
      applyTempStyle(data.tempStyle, data.tempTime);
    }
  } else if (data.error) {
    console.error(data.error);
  }
}

export function getStatusColor(data) {
    if (data.staffInRoom) {
      return "#5DCFE1";
    } else if (data.currentUsers == 0) {
      return "#3AFF4E";
    } else if (data.currentUsers < data.capacity) {
      return "#FFFF00";
    } else if (data.currentUsers >= data.capacity) {
      return "#FF4400";
    }
}
  
export function getStatusText(data) {
    if (data.staffInRoom) {
      return "EVENT";
    } else if (data.currentUsers == 0) {
      return "Frei";
    } else if (data.currentUsers < data.capacity) {
      return "Besetzt";
    } else if (data.currentUsers >= data.capacity) {
      return "Voll";
    }
}
  
export function interpolateColor(color1, color2, ratio) {
    var r = Math.round(color1[0] + ratio * (color2[0] - color1[0]));
    var g = Math.round(color1[1] + ratio * (color2[1] - color1[1]));
    var b = Math.round(color1[2] + ratio * (color2[2] - color1[2]));
    return [r, g, b];
}

export function percentageToColor(percentage) {
  var startColor = [2, 255, 0]; // #02ff00
  var middleColor = [255, 237, 0]; // #ffed00
  var endColor = [255, 0, 0]; // #ff0000

  if (percentage <= 50) {
      var ratio = percentage / 50;
      var rgb = interpolateColor(startColor, middleColor, ratio);
      return { color: rgb.map(x => x.toString(16).padStart(2, '0')).join(''), yellowBreakpoint: '100%' };
  } else if (percentage > 50 && percentage < 100){
      var ratio = (percentage - 50) / 50;
      var rgb = interpolateColor(middleColor, endColor, ratio);
      var yellowBreakpoint = Math.floor(100 - ratio * 50 - 3);
      return { color: rgb.map(x => x.toString(16).padStart(2, '0')).join(''), yellowBreakpoint: `${yellowBreakpoint}%` };
  } else {
    var ratio = (percentage - 50) / 50;
    var rgb = interpolateColor(middleColor, endColor, ratio);
    var yellowBreakpoint = Math.floor(100 - ratio * 50 - 3);
    return { color: rgb.map(x => x.toString(16).padStart(2, '0')).join(''), yellowBreakpoint: `${yellowBreakpoint}%` };
  }
}

export function setProgressBar(progressBarFill, fillPercentage, progressBarOverlay, overlayPercentage) {
  progressBarFill.style.width = `${Math.floor(fillPercentage)}%`;
  progressBarOverlay.style.width = `${Math.floor(overlayPercentage)}%`;

  var { color, yellowBreakpoint } = percentageToColor(Math.floor(fillPercentage));
  progressBarFill.style.background = `linear-gradient(to right, #02ff00 0%, #ffed00 ${yellowBreakpoint}, #${color} 100%)`;
}