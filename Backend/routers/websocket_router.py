from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Cookie, HTTPException
from fastapi.websockets import WebSocketState
from .access_token_router import decode_access_token
from database.messages import save_message, get_messages_between_users

ws_router = APIRouter()
active_connections = {}

@ws_router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    access_token: str = Cookie(None)
):
    await websocket.accept()
    print(active_connections)
    if not access_token:
        await websocket.close(code=1008, reason="Not authenticated")
        return

    try:
        username = decode_access_token(access_token)
        active_connections[username] = websocket

        while True:
            data = await websocket.receive_json()
            if "receiver" not in data or "text" not in data:
                continue

            receiver = data["receiver"]
            text = data["text"]
            saved_msg = await save_message(username, receiver, text)

            if receiver in active_connections:
                await active_connections[receiver].send_json({
                    "type": "new_message",
                    "message": saved_msg
                })
                
            await websocket.send_json({
                "type": "new_message",
                "message": saved_msg
            })

    except WebSocketDisconnect:
        if username in active_connections:
            del active_connections[username]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close(code=1011)
