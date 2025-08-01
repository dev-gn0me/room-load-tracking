import asyncio
import websockets
import json
import random
import hashlib
import threading

# Flag to control when to send card_id
send_card_id = False

async def card_hash_server(websocket, path):
    global send_card_id
    while True:
        if send_card_id:
            # Zufallszahl generieren
            card_id = str(random.randint(1000, 9999))
            # Hash card_id
            card_id_hash = hashlib.sha256(card_id.encode()).hexdigest()
            # Für random Hash diese Zeile statt Hash: hashlib.sha256(card_id.encode()).hexdigest()

            # Daten an Client schicken
            data = json.dumps({'card_id_hash': card_id_hash})
            await websocket.send(data)
            send_card_id = False

        # Kurzes Timeout nach dem Scan
        await asyncio.sleep(0.1)

def user_interaction_loop():
    global send_card_id
    while True:
        input("Press Enter to send a card ID...")
        send_card_id = True

if __name__ == "__main__":
    # Starte WebSocket Server
    start_server = websockets.serve(card_hash_server, "localhost", 3030)

    # Starte Skript interaktion mit dem Benutzer 
    threading.Thread(target=user_interaction_loop).start()

    # Start Event-Loop
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
