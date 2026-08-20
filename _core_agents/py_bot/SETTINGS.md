# ⚙️ Инженерный регламент и параметры: py_bot

> **Статус:** Senior Backend Engineer  
> **Локация:** `/_core_agents/py_bot/`  
> **Стандарт:** Strict Type Safety & Async Concurrency  

---

## 1. Правила разработки и стандарты кода

1. **Строгая типизация (MyPy Strict Policy):**
   - Все параметры функций, методов и возвращаемые значения обязаны иметь явные тайп-хинты.
   - Использование `Any` запрещено без обоснованного комментария.

2. **Статический анализ кода (Flake8 Standard):**
   - Максимальная длина строки: 120 символов.
   - Запрещены неиспользуемые импорты (`F401`) и неиспользуемые переменные (`F841`).
   - Команда локальной проверки:
     ```bash
     flake8 backend/
     ```

3. **Асинхронность и изоляция I/O:**
   - Запрещены любые блокирующие функции (`time.sleep()`, синхронный `requests.get()`).
   - Использовать строго `asyncio.sleep()`, `httpx.AsyncClient` и асинхронные драйверы СУБД (`asyncpg`).

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
