# 📰 Инженерный журнал: БЛОК 2 — Раздел «Лента & Форум» (02_BLOCK_2_FORUM.md)

> **Проект:** SmartContractum Enterprise Platform  
> **Статус:** Реализован и Завершен (100% Green)  
> **Дата реализации:** 2026-08-19 23:25:00  
> **Исполнители:** `pm_bot`, `py_bot`, `ui_bot`, `qa_bot`, `devops_bot`

---

## 1. Спецификация и состав реализованного функционала

### 2.1 Левая боковая панель (Категории рынка):
- Боковое меню с 6 категориями рынка:
  * 💬 *Все обсуждения* (slug: `all`)
  * 🔒 *Безопасные сделки* (slug: `safe-deals`)
  * 🏦 *Казначейство & B2B* (slug: `treasury-b2b`)
  * 🌐 *Источники данных (Оракулы)* (slug: `oracles`)
  * 🛡️ *ИБ, Аудит & Bug Bounty* (slug: `infosec-audit`)
  * 🌾 *АПК & Субсидии* (slug: `agro-subsidies`)
- Динамическая фильтрация ленты без перезагрузки страницы (AJAX Fetch к `/api/v1/forum/topics`).
- Интерактивные счетчики количества тем по категориям.

### 2.2 Центральная лента (Карточка топика / обсуждения):
- Кнопка **«✍️ Создать тему»** с модальным окном.
- Карточка топика (Topic Card):
  * Аватар автора с инициалами в градиентном круге.
  * Имя и роль автора (например: *«Ассоциация ФинТех»*, *«Регуляторный комплаенс»*).
  * Дата и время публикации.
  * Официальный бейдж статуса (*«Официальное обсуждение НИР»*, *«Вопрос к ЦБ»*, *«Сценарий АБР»*, *«ИБ & Аудит»*).
  * Заголовок и сниппет (до 200 символов).
  * Интерактивные теги темы (`#ПКСК_2026`, `#Оракулы`, `#B2B`, `#Standoff365`).
  * Футер карточки: счетчик ответов, счетчик просмотров, кнопка «В закладки».

### 2.3 Правая боковая панель (Виджет Статуса ПКСК):
- **Графический таймлайн регулятора (Stepper):**
  * `18.06.2026`: *Концепция опубликована* (Зеленый чек)
  * `До 30.09.2026`: *Сбор обратной связи от рынка* (Активный этап / Пульсирующий индикатор)
  * `До 31.03.2027`: *Фаза НИР ЦБ РФ по вариантам ПКСК*
- **Облако популярных тегов** с быстрой фильтрацией.
- **CTA-блок:** Призыв к переходу в Конструктор контрактов.

### 2.4 Модальное окно создания темы:
- Поля формы: Заголовок (min 10 символов), Категория (Dropdown), Теги, Текст (min 30 символов, Markdown).
- Валидация на клиенте и сервере (Pydantic v2).
- Защита от XSS-инъекций (`html.escape` + regex фильтрация тегов).
- Автоматический расчет сниппета, инкремент счетчиков и препенд созданной темы в DOM ленты.

---

## 2. Архитектура backend и моделей данных

### Схемы данных (`backend/models/forum.py`):
- `Category`: `id, name, slug, icon, count_topics`
- `Topic`: `id, title, snippet, body, author_name, author_role, author_avatar, is_official, official_badge, category_id, category_slug, views_count, replies_count, tags, created_at`
- `TopicCreateRequest`: Строгая валидация длин полей и санитизация HTML.
- `CategoryListResponse`, `TopicListResponse`, `TopicResponse`.

### REST API Эндпоинты (`backend/routers/forum.py`):
- `GET /api/v1/forum/categories` — список категорий и живые счетчики.
- `GET /api/v1/forum/topics` — пагинация и фильтрация по `category_slug` и `tag`.
- `POST /api/v1/forum/topics` — создание нового обсуждения (HTTP 201).
- `GET /feed` — полный SSR рендеринг 3-колоночной страницы форума.

---

## 3. Протокол контроля качества (QA Protocol)

### Результаты автоматических тестов (`pytest -v tests/unit`):
```text
tests/unit/test_base_routes.py::test_index_endpoint_returns_200_and_html PASSED [  7%]
tests/unit/test_base_routes.py::test_navigation_subpages_return_200 PASSED [ 14%]
tests/unit/test_base_routes.py::test_static_assets_availability PASSED   [ 21%]
tests/unit/test_base_routes.py::test_security_headers_injected PASSED    [ 28%]
tests/unit/test_forum_api.py::test_get_forum_categories_returns_200_and_list PASSED [ 35%]
tests/unit/test_forum_api.py::test_get_forum_topics_default_returns_all PASSED [ 42%]
tests/unit/test_forum_api.py::test_filter_topics_by_category PASSED      [ 50%]
tests/unit/test_forum_api.py::test_filter_topics_by_nonexistent_category_returns_empty_list PASSED [ 57%]
tests/unit/test_forum_api.py::test_filter_topics_by_tag PASSED           [ 64%]
tests/unit/test_forum_api.py::test_create_topic_success PASSED           [ 71%]
tests/unit/test_forum_api.py::test_create_topic_xss_sanitization PASSED  [ 78%]
tests/unit/test_forum_api.py::test_create_topic_validation_errors PASSED [ 85%]
tests/unit/test_forum_api.py::test_render_forum_feed_html_page PASSED    [ 92%]
tests/unit/test_health.py::test_health_check PASSED                      [100%]

======================== 14 passed, 0 failed in 0.41s =========================
```

- **Статический анализ:** Flake8 (0 ошибок), Black (100% clean), MyPy (11 source files checked, 0 errors).
- **Безопасность:** Защита от XSS, Security Headers (`nosniff`, `DENY`, `mode=block`).
