# Starter Kit

Стартовый шаблон приложения: бэкенд на FastAPI (Python, async) и фронтенд на React (TypeScript). Содержит типовую структуру проекта, настройки окружения, базовые сущности и UI-компоненты — точку входа для разработки без поднятия всего с нуля.

## Стек

- **Backend:** FastAPI, Uvicorn, SQLAlchemy (async), asyncpg, Pydantic, Pydantic Settings, Loguru, Pendulum, orjson, PyJWT, pytokens, httpx, python-dotenv, openpyxl (Excel), Swagger UI
- **Frontend:** React 19, TypeScript, Vite, FSD, React Router, Tanstack React Query, Tanstack Table, Zustand, Ant Design, Axios, Zod, dayjs, Keycloak, Lottie, react-helmet, typed-openapi (генерация API из OpenAPI)

## Автогенерация типов API

Типы и клиент для бэкенд-API получают из OpenAPI-схемы, чтобы фронт и бэк оставались в консистентном состоянии.

1. **Схема с бэкенда.** FastAPI отдаёт OpenAPI по адресу `/api/openapi.json`. Чтобы сохранить схему в репозиторий, из корня `backend` выполните:
   ```bash
   python export_openapi.py
   ```
   По умолчанию создаётся файл `frontend/openapi.json` (путь можно задать аргументом).

2. **Генерация кода на фронте.** Из каталога `frontend`:
   ```bash
   npm run generate:api
   ```
   Команда вызывает `typed-openapi` с флагом `--tanstack`: читает `openapi.json` и пишет в `src/shared/api/generated.ts` типы схем (запросы/ответы), типы эндпоинтов и типизованный API-клиент, заточенный под Tanstack Query.

3. **Использование.** В `src/shared/api/apiClient.ts` настроены `api` (клиент из сгенерированного кода) и `tanstackApi` (обёртка под React Query). Запросы идут через общий axios-инстанс (baseURL, Keycloak и т.д.). После изменений на бэкенде нужно заново выполнить шаги 1 и 2.

## База данных

Схема проектируется и создаётся вручную в СУБД. Модели в `backend/models/` описывают структуру таблиц для использования в коде (ORM, типизация) и должны соответствовать реальной схеме в базе.
