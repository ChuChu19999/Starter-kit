from datetime import date
import pendulum


def parse_date(date_str: str) -> date:
    """
    Парсинг даты из строки формата YYYY-MM-DD с использованием pendulum.
    """
    return pendulum.parse(date_str).date()
