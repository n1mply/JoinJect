from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
from database.messages import create_message_indexes
from github_oauth import github_router
from routers.project_router import project_router
from routers.user_router import user_router
from routers.auth_router import auth_router
from routers.websocket_router import ws_router
from routers.messages_router import msg_router
from routers.chats_router import chats_router
from routers.access_token_router import decode_access_token


app = FastAPI()
app.include_router(github_router)
app.include_router(project_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(ws_router)
app.include_router(msg_router)
app.include_router(chats_router)

@app.on_event("startup")
async def startup():
    await create_message_indexes()
    print("Starting up...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.1.10:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/me")
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_access_token(token)
    return {"username": username}

@app.get("/data/{name}")
async def get_data(name: str):
    with open(f'data/{name}.json', 'r') as file:
        data = json.load(file)
        return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)