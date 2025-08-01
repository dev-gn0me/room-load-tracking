// applyStyle.js
// Für die StatusBox auf dem Terminal
// Fetch Styles from the terminal-status.json file
async function fetchStyles() {
    const response = await fetch('/terminal-status.json');
    const data = await response.json();
    return data;
}

// Anwenden von Styles basierend auf Raumdaten (konstant)
async function applyConstStyle(currentUsers, capacity, status = '', staffInRoom = false) {
    const styles = await fetchStyles();

    let defaultStatus = currentUsers === 0 ? 'free-reading' : (staffInRoom ? 'event-blocked' : (currentUsers < capacity ? 'used-reading' : 'full-reading'));
    status = status || defaultStatus;

    applyStyle(status, styles, '.card-rfid-status');

    sessionStorage.setItem('currentStatus', status);
}

// Anwenden von Styles basierend auf Events/Funktionsaufrufen (temporär) - nach timeout wieder zurück zum konstanten Style
async function applyTempStyle(tempStyle, duration = 2000) {
    const styles = await fetchStyles();

    if(!styles[tempStyle]) return;

    applyStyle(tempStyle, styles, '.card-rfid-status');

    setTimeout(() => {
        const constStyle = sessionStorage.getItem('currentStatus');
        applyStyle(constStyle, styles, '.card-rfid-status');
    }, duration);
}

function applyStyle(status, styles, element) {
    const boxStyles = styles[status].box;
    const textStyles = styles[status].text;
    const infoTextStyles = styles[status].infotext;
    const widgetCircleStyles = styles[status].widgetCircle;

    const box = document.querySelector(element);
    for(let style in boxStyles) {
        box.style[style] = boxStyles[style];
    }

    const text = document.querySelector('.text-rfid-status');
    for(let style in textStyles) {
        text.style[style] = textStyles[style];
        text.innerText = textStyles.content;
    }

    const infoText = document.querySelector('.text-rfid-info');
    for(let style in infoTextStyles) {
        infoText.style[style] = infoTextStyles[style];
        infoText.innerText = infoTextStyles.content;
    }

    const widgetCircle = document.getElementById('percentageBox'); // Selektor muss widget circle als Ziel haben
    for(let style in widgetCircleStyles) {
        if (style.startsWith('--')) { // benutze CSS Variables
            widgetCircle.style.setProperty(style, widgetCircleStyles[style]);
        } else {
            widgetCircle.style[style] = widgetCircleStyles[style];
        }
    }
}
