# ⚙️ Инженерный регламент и параметры: qa_bot

> **Статус:** QA & Reliability Engineer  
> **Локация:** `/_core_agents/qa_bot/`  
> **Стандарт:** Zero Bad Commits & 100% In-Memory Test Isolation  

---

## 1. Регламент проведения тестов (Anti-Timeout Policy)

1. **Строгая изоляция в оперативной памяти (In-Memory Only):**
   - Все тесты FastAPI выполняются исключительно через `starlette.testclient.TestClient`.
   - **Запрещено использовать внешние сетевые сокеты и дергать `http://localhost:8000`.**

2. **Раздельный запуск команд (Single Command Execution):**
   - Никогда не объединять команды `pytest` и `flake8` через оператор `&&`.
   ```bash
   # Шаг 1: Тесты
   pytest tests/unit

   # Шаг 2: Линтер
   flake8 backend/
   ```

3. **Матрица тестового покрытия:**
   | Тестовый модуль | Файл | Ожидаемый результат |
   | :--- | :--- | :---: |
   | Базовый каркас | `tests/unit/test_base_routes.py` | 4/4 PASSED |
   | Первый экран и карточки | `tests/unit/test_home_routes.py` | 7/7 PASSED |
   | Форум и инициативы | `tests/unit/test_forum_api.py` | 9/9 PASSED |
   | Мастер Паспорта | `tests/unit/test_passport_api.py` | 4/4 PASSED |
   | Конструктор решений | `tests/unit/test_builder_api.py` | 3/3 PASSED |
   | Источники данных | `tests/unit/test_data_sources_api.py`| 6/6 PASSED |
   | Профиль участника | `tests/unit/test_profile_api.py` | 6/6 PASSED |
   | Health-мониторинг | `tests/unit/test_health.py` | 1/1 PASSED |
   | **ИТОГО** | **Полный контур** | **40/40 PASSED (100% Green)** |
