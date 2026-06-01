import asyncio
from typing import Any, Optional
import httpx
from core.config import settings
from core.http_clients import get_hr_client
from core.logger import logger

HR_HASHES_BATCH_SIZE = 500


def _merge_employee_record(
    result: dict[str, dict[str, Any]], employee: dict[str, Any]
) -> None:
    """Слияние записи HR: при дубликате hash приоритет у workingNowStatus «Работает»."""
    if not isinstance(employee, dict) or "hashMd5" not in employee:
        return
    hash_md5 = employee.get("hashMd5")
    if not hash_md5:
        return
    if hash_md5 in result:
        current_status = result[hash_md5].get("workingNowStatus")
        new_status = employee.get("workingNowStatus")
        if new_status == "Работает" and current_status != "Работает":
            result[hash_md5] = employee
    else:
        result[hash_md5] = employee


async def _fetch_employees_by_hashes_batch(
    hashes_md5: list[str], include_photo: bool
) -> dict[str, dict[str, Any]]:
    """Один POST by-hashes в HR API."""
    if not hashes_md5:
        return {}

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
        logger.debug("Сотрудники с указанными hash_md5 не найдены в HR API (404)")
        return {}

    response.raise_for_status()
    employees_data = response.json()

    batch_result: dict[str, dict[str, Any]] = {}
    if isinstance(employees_data, list):
        for employee in employees_data:
            _merge_employee_record(batch_result, employee)
    return batch_result


async def search_employees_by_fio(
    search_fio: str, include_photo: bool = True
) -> list[dict[str, Any]]:
    """
    Поиск сотрудников по ФИО через HR API.
    """
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
    Возвращает None, если сотрудник не найден (404).
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
    Возвращает словарь только с найденными сотрудниками. Отсутствующие в HR API игнорируются.
    """
    if not hashes_md5:
        return {}

    if not settings.HR_API_URL:
        logger.error("HR_API_URL не настроен")
        raise ValueError("HR_API_URL не настроен")

    result: dict[str, dict[str, Any]] = {}

    try:
        if len(hashes_md5) <= HR_HASHES_BATCH_SIZE:
            batches = [hashes_md5]
        else:
            batches = [
                hashes_md5[i : i + HR_HASHES_BATCH_SIZE]
                for i in range(0, len(hashes_md5), HR_HASHES_BATCH_SIZE)
            ]

        batch_results = await asyncio.gather(
            *[
                _fetch_employees_by_hashes_batch(batch, include_photo)
                for batch in batches
            ]
        )

        for batch_result in batch_results:
            for hash_md5, employee in batch_result.items():
                _merge_employee_record(result, employee)

        return result

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.debug("Сотрудники с указанными hash_md5 не найдены в HR API (404)")
            return result
        logger.error(f"Ошибка HTTP при обращении к HR API: {str(e)}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Ошибка при обращении к HR API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Внутренняя ошибка сервера: {str(e)}")
        raise
