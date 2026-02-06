#!/usr/bin/env python3
"""
Simple WebSocket server for ChatP2P message synchronization
Runs on port 8001
"""

import json
import asyncio
import websockets
from datetime import datetime

# Store active connections and messages
connections = {}
messages = {}

async def handle_client(websocket, path):
    """Handle a new WebSocket connection"""
    client_id = None
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get('action')
                
                # Register client
                if action == 'register':
                    client_id = data.get('wallet')
                    connections[client_id] = websocket
                    print(f"✅ Cliente registrado: {client_id[:10]}...")
                    await websocket.send(json.dumps({
                        'status': 'registered',
                        'wallet': client_id
                    }))
                
                # Send message
                elif action == 'send_message':
                    msg_key = data.get('key')
                    msg_data = data.get('message')
                    
                    # Store message
                    if msg_key not in messages:
                        messages[msg_key] = {}
                    messages[msg_key][msg_data['timestamp']] = msg_data
                    
                    # Get recipient wallet
                    wallets = msg_key.split('_')
                    recipient = wallets[0] if wallets[1] == client_id else wallets[1]
                    
                    # Send to recipient if connected
                    if recipient in connections:
                        try:
                            await connections[recipient].send(json.dumps({
                                'action': 'new_message',
                                'key': msg_key,
                                'message': msg_data
                            }))
                            print(f"📨 Mensaje enviado: {client_id[:10]}... → {recipient[:10]}...")
                        except:
                            pass
                    
                    # Confirm to sender
                    await websocket.send(json.dumps({
                        'status': 'message_sent',
                        'timestamp': msg_data['timestamp']
                    }))
                
                # Get messages
                elif action == 'get_messages':
                    msg_key = data.get('key')
                    msgs = messages.get(msg_key, {})
                    await websocket.send(json.dumps({
                        'action': 'messages',
                        'key': msg_key,
                        'messages': msgs
                    }))
                
                # Ping
                elif action == 'ping':
                    await websocket.send(json.dumps({'status': 'pong'}))
                    
            except json.JSONDecodeError:
                await websocket.send(json.dumps({'error': 'Invalid JSON'}))
            except Exception as e:
                print(f"❌ Error: {e}")
                await websocket.send(json.dumps({'error': str(e)}))
    
    except websockets.exceptions.ConnectionClosed:
        if client_id and client_id in connections:
            del connections[client_id]
            print(f"❌ Cliente desconectado: {client_id[:10]}...")

async def main():
    """Start WebSocket server"""
    print("🚀 Iniciando servidor de sincronización...")
    print("📍 ws://localhost:8001")
    
    async with websockets.serve(handle_client, "localhost", 8001):
        print("✅ Servidor listo")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ Servidor detenido")
