# ⚙️ Инженерный регламент и параметры: py_bot

> **Проект:** SmartContractum Enterprise Platform  
> **Роль:** Senior Backend Engineer  
> **Стандарт:** Strict Type Safety & Async Concurrency  

---

## 1. Правила разработки и стандарты кода

1. **Строгая типизация (MyPy Strict Policy):**
   - Все параметры функций, методов и возвращаемые значения обязаны иметь явные тайп-хинты.
   - Использование `Any` запрещено без обоснованного комментария.
   ```python
   # Пример строгого стандарта:
   async def fetch_scenario_details(scenario_id: str) -> ScenarioSchema | None:
       ...
   ```

2. **Статический анализ кода (Flake8 Standard):**
   - Максимальная длина строки: 120 символов.
   - Запрещены неиспользуемые импорты (`F401`), висячие переменные (`F841`) и сложные циклы.
   - Команда локальной проверки:
     ```bash
     flake8 backend/
     ```

3. **Асинхронность и изоляция I/O:**
   - Запрещены любые блокирующие функции (`time.sleep()`, синхронный `requests.get()`, синхронный I/O).
   - Использовать строго `asyncio.sleep()`, `httpx.AsyncClient` и асинхронные драйверы СУБД.

4. **Работа с контекстом Jinja2:**
   - Передавать в шаблоны нормализованные словари данных с дефолтными значениями через `.get()` или Pydantic `.model_dump()`.

---

## 2. Конфигурация окружения (Environment Variables)

```env
# Backend Server
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Database & Cache
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/smartcontractum
REDIS_URL=redis://localhost:6379/0

# Security & CORS
SECRET_KEY=enterprise-pksc-secret-key-2026
ALLOWED_ORIGINS=["https://smartcontractum.ru", "http://localhost:8000"]
```

---

## 3. Регламент логирования в WORKLOG.md

В каждой записи `WORKLOG.md` раздел `py_bot` обязан содержать:
* Точный список затронутых модулей бэкенда (`backend/routers/...`, `backend/services/...`).
* Добавленные или модифицированные API-эндпоинты и структуры данных.
* Подтверждение чистоты статического анализа (`flake8 backend/ -> 0 errors`).
