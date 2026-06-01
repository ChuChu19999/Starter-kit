from fastapi import APIRouter, Depends
from core.security import get_current_user
from schemas.user import UserResponse
from services.user import get_user_from_token

router = APIRouter()


@router.get(
    "/me/",
    response_model=UserResponse,
    summary="Получение информации о текущем пользователе",
    description=(
        "Возвращает информацию о текущем авторизованном пользователе на основе JWT токена. "
        "Извлекает данные пользователя из токена, включая hsnils и другие атрибуты."
    ),
    responses={
        200: {
            "description": "Информация о пользователе успешно получена",
            "content": {
                "application/json": {
                    "example": {
                        "personnel_number": "12345",
                        "department_number": 100,
                        "full_name": "Тестовый Пользователь",
                        "ad_login": "user@example.com",
                        "email": "user@example.com",
                        "hsnils": "e1cee128188b77f382eec32ca80494e6",
                        "is_staff": False,
                    }
                }
            },
        },
        401: {"description": "Токен отсутствует или невалидный"},
    },
)
async def get_current_user_info(decoded_token: dict = Depends(get_current_user)):
    """
    Получение информации о текущем пользователе из JWT токена.

    Требует валидный JWT токен в заголовке X-API-KEY.
    """
    return get_user_from_token(decoded_token)
