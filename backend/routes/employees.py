from fastapi import APIRouter, Body, HTTPException, Query
from core.security import IsAuthenticated
from schemas.employees import EmployeeResponse, EmployeesByHashesRequest
from services.employees import (
    get_employee_by_hash,
    get_employees_by_hashes,
    search_employees_by_fio,
)

router = APIRouter()


@router.get(
    "/search/",
    response_model=list[EmployeeResponse],
    summary="Поиск сотрудников по ФИО",
    description=(
        "Выполняет поиск сотрудников в HR API по части ФИО. "
        "Минимальная длина поискового запроса - 3 символа. "
        "Возвращает список сотрудников с их данными, включая опционально фотографии."
    ),
    responses={
        200: {
            "description": "Список найденных сотрудников",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "hashMd5": "abc123def456789012345678901234ab",
                            "fullName": "Иванов Иван Иванович",
                            "department": "Отдел IT",
                            "jobTitle": "Разработчик",
                        }
                    ]
                }
            },
        },
        400: {"description": "Поисковый запрос слишком короткий (менее 3 символов)"},
        503: {"description": "Ошибка при обращении к HR API"},
    },
)
# @IsAuthenticated
async def search_employees(
    search_fio: str = Query(
        ...,
        min_length=3,
        alias="searchFio",
        description="Часть ФИО для поиска (минимум 3 символа)",
        examples=["Иванов"],
    ),
    include_photo: bool = Query(
        True,
        alias="includePhoto",
        description="Включать ли фотографии сотрудников в ответ",
    ),
):
    """
    Поиск сотрудников по части ФИО (не менее 3 символов).
    """
    try:
        employees = await search_employees_by_fio(
            search_fio, include_photo=include_photo
        )
        return employees
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503, detail=f"Ошибка при обращении к HR API: {str(e)}"
        )


@router.get(
    "/{hash_md5}/",
    response_model=EmployeeResponse,
    summary="Получение информации о сотруднике",
    description=(
        "Возвращает полную информацию о сотруднике по его hashMd5 (hsnils). "
        "Данные получаются из HR API. Может включать фотографию сотрудника."
    ),
    responses={
        200: {
            "description": "Информация о сотруднике",
            "content": {
                "application/json": {
                    "example": {
                        "hashMd5": "abc123def456789012345678901234ab",
                        "fullName": "Иванов Иван Иванович",
                        "department": "Отдел IT",
                        "division": "Разработка",
                        "login": "ivanov",
                    }
                }
            },
        },
        404: {"description": "Сотрудник не найден"},
        503: {"description": "Ошибка при обращении к HR API"},
    },
)
# @IsAuthenticated
async def get_employee(
    hash_md5: str,
    include_photo: bool = Query(
        True, alias="includePhoto", description="Включать ли фотографии в ответ"
    ),
):
    """
    Получение информации о сотруднике по hashMd5.

    hashMd5 - это MD5 хэш СНИЛС сотрудника, используемый для идентификации в HR API.
    """
    try:
        employee = await get_employee_by_hash(hash_md5, include_photo=include_photo)
        if employee is None:
            raise HTTPException(status_code=404, detail="Сотрудник не найден")
        return employee
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503, detail=f"Ошибка при обращении к HR API: {str(e)}"
        )


@router.post(
    "/by-hashes/",
    response_model=dict[str, EmployeeResponse],
    summary="Получение информации о сотрудниках (батч)",
    description=(
        "Возвращает информацию о нескольких сотрудниках по массиву hashMd5. "
        "Полезно для получения данных о множестве сотрудников одним запросом. "
        "Если массив пуст, возвращается пустой объект."
    ),
    responses={
        200: {
            "description": "Словарь с информацией о сотрудниках, где ключ - hashMd5",
            "content": {
                "application/json": {
                    "example": {
                        "abc123def456789012345678901234ab": {
                            "hashMd5": "abc123def456789012345678901234ab",
                            "fullName": "Иванов Иван Иванович",
                            "department": "Отдел IT",
                        },
                        "def456abc7890123456789012345678cd": {
                            "hashMd5": "def456abc7890123456789012345678cd",
                            "fullName": "Петров Петр Петрович",
                            "department": "Отдел продаж",
                        },
                    }
                }
            },
        },
        503: {"description": "Ошибка при обращении к HR API"},
    },
)
# @IsAuthenticated
async def get_employees_by_hashes_endpoint(
    request: EmployeesByHashesRequest = Body(...),
):
    """
    Получение информации о сотрудниках по массиву hashMd5 (батч-запрос).

    Принимает массив hashMd5 и возвращает словарь с информацией о найденных сотрудниках.
    Если сотрудник не найден, он не включается в результат.
    """
    if not request.hashesMd5:
        return {}

    try:
        employees = await get_employees_by_hashes(
            request.hashesMd5, include_photo=request.includePhoto
        )
        return employees
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503, detail=f"Ошибка при обращении к HR API: {str(e)}"
        )
