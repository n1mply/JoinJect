from access_token_actions import decode_access_token
from database import create_project, get_projects
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Annotated
from annotated_types import MaxLen, MinLen

project_router = APIRouter()

class Project(BaseModel):
    name: Annotated[str, MinLen(1), MaxLen(20)]
    description: Annotated[str, MinLen(80), MaxLen(500)]
    skills: Annotated[list, MinLen(1), MaxLen(60)]
    members: Annotated[list, MinLen(1), MaxLen(60)]
    time_to_complite: Annotated[str, MinLen(1), MaxLen(3)]
    time_to_start: Annotated[str, MinLen(1), MaxLen(2)]


@project_router.post('/project/create')
async def post_project_data(project_data: Project, request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_access_token(token)
    project_data = project_data.dict()
    result = await create_project(project_data, username)
    if 'message' in result:
        return {'message': result['message']}
    else: 
        raise HTTPException(status_code=400, detail={'error': result['error']})
    

@project_router.get('/project/get_projects')
async def get_project_data(request: Request):
    projects = await get_projects()
    return {"projects": projects}