# Starter Kit

Стартовый шаблон приложения: бэкенд на FastAPI (Python, async) и фронтенд на React (TypeScript). Содержит типовую структуру проекта, настройки окружения, базовые сущности и UI-компоненты — точку входа для разработки без поднятия всего с нуля.

## Стек

- **Backend:** FastAPI, Uvicorn, SQLAlchemy (async), asyncpg, Pydantic, Pydantic Settings, Loguru, Pendulum, orjson, PyJWT, pytokens, httpx, python-dotenv, openpyxl (Excel), Swagger UI
- **Frontend:** React 19, TypeScript, Vite, FSD, React Router, Tanstack React Query, Zustand, Ant Design, Axios, Zod, dayjs, Keycloak, Lottie, react-helmet

## База данных

Схема проектируется и создаётся вручную в СУБД. Модели в `backend/models/` описывают структуру таблиц для использования в коде (ORM, типизация) и должны соответствовать реальной схеме в базе.
