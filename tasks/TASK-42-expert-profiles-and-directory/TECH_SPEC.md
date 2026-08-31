# TECH_SPEC.md — Техническая спецификация каталога и профилей экспертов (TASK-42)

## 1. Архитектура базы данных и методы (`db.py`)
- Метод `get_experts_directory(competency: str = None, search: str = None, limit: int = 50, offset: int = 0) -> list[dict]`:
  - Выборка из `users` и `user_reputation` с объединением репутации, подтвержденных компетенций, бейджей верификации и подсчетом количества публикаций.
- Метод `get_expert_profile(user_id: int) -> dict | None`:
  - Выборка полного санитизированного профиля эксперта, включая список его статей, вопросов, принятых ответов и контактов.

## 2. Спецификация REST API (`server.py`)
- `GET /experts`, `/experts.html`: Отдача HTML страницы каталога специалистов.
- `GET /api/experts`: Query params: `competency`, `search`, `limit`, `offset`. Возвращает `{ success: true, count: N, experts: [...] }`.
- `GET /api/experts/<id>`: Возвращает `{ success: true, expert: {...}, publications: [...], acceptedAnswers: [...] }`.

## 3. Вердикт
`APPROVED`
