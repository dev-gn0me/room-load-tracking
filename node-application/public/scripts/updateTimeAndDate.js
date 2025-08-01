// updateTimeAndDate.js
// Aktualisiert Zeit und Datum
function updateTimeAndDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('de-DE', options);
  
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
  
    setTimeout(updateTimeAndDate, 1000);
  }
  
  window.onload = updateTimeAndDate;
  