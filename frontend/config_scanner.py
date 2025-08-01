#scanConfigIni.py
import configparser
import webbrowser
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Todo: Für merh Sicherheit nur spezielle Routen erlauben -> CORS(app, origins=["http://localhost:8080"])
CORS(app)  # CORS für alle Routen

@app.route('/config', methods=['GET'])
def get_client_config():
    config = configparser.ConfigParser()
    config.read('config.ini')
    roomNumber = config.get('ROOM', 'RoomNumber')
    clientType = config.get('CLIENT', 'Type')
    return jsonify({'roomNumber': roomNumber, 'clientType': clientType})

if __name__ == '__main__':
    app.run(port=5000)