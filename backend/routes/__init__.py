from fastapi import APIRouter, Request
from routes import employees, user

api_router = APIRouter(prefix="/api")

api_router.include_router(user.router, tags=("user",))
api_router.include_router(employees.router, prefix="/employees", tags=("employees",))


@api_router.get("/")
async def root(request: Request):
    """Информация о доступных API эндпоинтах."""
    app = request.app
    endpoints = []
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            path = route.path
            if path.startswith("/api"):
                for method in route.methods:
                    if method != "HEAD":
                        endpoint_info = {
                            "method": method,
                            "path": path,
                        }
                        endpoints.append(endpoint_info)
    return {
        "message": "Starter-kit API",
        "endpoints": sorted(endpoints, key=lambda x: (x["path"], x["method"])),
        "total": len(endpoints),
    }


@api_router.get(
    "/health/",
    summary="Проверка состояния API",
    description=(
        "Эндпоинт для проверки работоспособности API. "
        "Используется для мониторинга и health checks."
    ),
    responses={
        200: {
            "description": "API работает",
            "content": {"application/json": {"example": {"status": "ok"}}},
        }
    },
)
async def health():
    """
    Проверка состояния API.

    Возвращает статус "ok" если API работает.
    """
    return {"status": "ok"}
