"""
Скрипт экспорта OpenAPI-схемы в JSON без запуска сервера.
Используется для генерации TypeScript-клиента во фронтенде.

Запуск из корня backend: python export_openapi.py [путь/к/openapi.json]
По умолчанию пишет в ../frontend/openapi.json.
"""

import json
import sys
from pathlib import Path

# Запуск предполагается из директории backend
sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import app

if __name__ == "__main__":
    out_path = (
        Path(sys.argv[1])
        if len(sys.argv) > 1
        else Path(__file__).parent / "../frontend/openapi.json"
    )
    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    schema = app.openapi()
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, ensure_ascii=False, indent=2)
    print(f"OpenAPI schema written to {out_path}")
