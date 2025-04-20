from fastapi import HTTPException, APIRouter, Depends, Request
from database import get_userdata_by_name

user_router = APIRouter()


@user_router.get('/user/{name}')
async def get_user_by_name(name: str):
    print(f"Searching for user: {name}")  # Логируем имя пользователя
    user_data = await get_userdata_by_name(name)
    if user_data and 'error' not in user_data:  # Проверяем, что пользователь найден и нет ошибок
        return {'user_data': user_data}
    else:
        raise HTTPException(status_code=404, detail='User not found!')