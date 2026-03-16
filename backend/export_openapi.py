"""
Скрипт для генерации TypeScript-клиента во фронтенде.

Запуск из корня backend: python export_openapi.py [путь/к/openapi.json]
По умолчанию пишет в ../frontend/openapi.json.
"""

import sys
from pathlib import Path
import orjson

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
    payload = orjson.dumps(schema, option=orjson.OPT_INDENT_2)
    with open(out_path, "wb") as f:
        f.write(payload)
    print(f"OpenAPI schema written to {out_path}")
