from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
from githubOauth import github_router
from project_actions import project_router
from user_actions import user_router
from auth_actions import auth_router
from access_token_actions import decode_access_token


app = FastAPI()
app.include_router(github_router)
app.include_router(project_router)
app.include_router(user_router)
app.include_router(auth_router)


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

@app.get("/data")
async def get_data():
    with open('data/options.json', 'r') as file:
        data = json.load(file)
        return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)