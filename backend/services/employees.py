from typing import Any, Optional
import httpx
from core.config import settings
from core.http_clients import get_hr_client
from core.logger import logger


async def search_employees_by_fio(
    search_fio: str, include_photo: bool = True
) -> list[dict[str, Any]]:
    """
    Поиск сотрудников по ФИО через HR API.
    """
    if not search_fio or len(search_fio) < 3:
        return []

    if not settings.HR_API_URL:
        logger.error("HR_API_URL не настроен")
        raise ValueError("HR_API_URL не настроен")

    try:
        url = f"{settings.HR_API_URL}/api/v2/employee/by-fio/{search_fio}?includeDismissed=true&recordsNumber=10&includePhoto={str(include_photo).lower()}"
        headers = {"Content-Type": "application/json"}

        client = await get_hr_client()
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        employees_data = response.json()

        if not isinstance(employees_data, list):
            if isinstance(employees_data, dict):
                employees_data = [employees_data]
            else:
                employees_data = []

        return employees_data

    except httpx.RequestError as e:
        logger.error(f"Ошибка при обращении к HR API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Внутренняя ошибка сервера: {str(e)}")
        raise


async def get_employee_by_hash(
    hash_md5: str, include_photo: bool = True
) -> Optional[dict[str, Any]]:
    """
    Получение информации о сотруднике по hashMd5 через HR API.
    """
    if not hash_md5:
        return None

    if not settings.HR_API_URL:
        logger.error("HR_API_URL не настроен")
        raise ValueError("HR_API_URL не настроен")

    try:
        url = f"{settings.HR_API_URL}/api/v2/employee/by-hash/{hash_md5}?includeDismissed=true&recordsNumber=1&includePhoto={str(include_photo).lower()}"
        headers = {"Content-Type": "application/json"}

        client = await get_hr_client()
        response = await client.get(url, headers=headers)

        if response.status_code == 404:
            logger.debug(f"Сотрудник с hash_md5={hash_md5} не найден в HR API (404)")
            return None

        response.raise_for_status()
        employee_data = response.json()

        return employee_data

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.debug(f"Сотрудник с hash_md5={hash_md5} не найден в HR API (404)")
            return None
        logger.error(f"Ошибка HTTP при обращении к HR API: {str(e)}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Ошибка при обращении к HR API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Внутренняя ошибка сервера: {str(e)}")
        raise


async def get_employees_by_hashes(
    hashes_md5: list[str], include_photo: bool = False
) -> dict[str, dict[str, Any]]:
    """
    Получение информации о сотрудниках по массиву hashMd5 через HR API (батч-запрос).
    """
    if not hashes_md5 or len(hashes_md5) == 0:
        return {}

    if not settings.HR_API_URL:
        logger.error("HR_API_URL не настроен")
        raise ValueError("HR_API_URL не настроен")

    try:
        url = f"{settings.HR_API_URL}/api/v2/employee/by-hashes/"
        headers = {"Content-Type": "application/json"}
        payload = {
            "hashesMd5": hashes_md5,
            "includeExtended": False,
            "includePhoto": include_photo,
            "includeExp": False,
            "includeDismissed": True,
            "includeAppointments": False,
        }

        client = await get_hr_client()
        response = await client.post(url, headers=headers, json=payload)

        if response.status_code == 404:
            logger.debug(f"Сотрудники с указанными hash_md5 не найдены в HR API (404)")
            return {}

        response.raise_for_status()
        employees_data = response.json()

        result = {}
        if isinstance(employees_data, list):
            for employee in employees_data:
                if isinstance(employee, dict) and "hashMd5" in employee:
                    hash_md5 = employee.get("hashMd5")
                    if hash_md5:
                        # Если для этого hash уже есть запись, выбираем ту, где workingNowStatus == "Работает"
                        if hash_md5 in result:
                            current_status = result[hash_md5].get("workingNowStatus")
                            new_status = employee.get("workingNowStatus")

                            # Заменяем только если новая запись имеет статус "Работает", а текущая - нет
                            if (
                                new_status == "Работает"
                                and current_status != "Работает"
                            ):
                                result[hash_md5] = employee
                        else:
                            result[hash_md5] = employee

        return result

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.debug(f"Сотрудники с указанными hash_md5 не найдены в HR API (404)")
            return {}
        logger.error(f"Ошибка HTTP при обращении к HR API: {str(e)}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Ошибка при обращении к HR API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Внутренняя ошибка сервера: {str(e)}")
        raise
