# 🌐 Инженерный журнал: БЛОК 5 — Маркетплейс Источников Данных & Оракулов (06_BLOCK_5_DATA_SOURCES.md)

> **Проект:** SmartContractum Enterprise Platform  
> **Статус:** Реализован и Завершен (100% Green)  
> **Дата реализации:** 2026-08-20 00:00:00  
> **Исполнители:** `pm_bot`, `py_bot`, `ui_bot`, `qa_bot`, `devops_bot`

---

## 1. Спецификация и состав реализованного функционала

### 1.1 Классификация и таблица источников (CBR Categories Table):
- Адаптивная таблица источников с фильтрацией по 3 регуляторным категориям:
  * **Государственные ИС (`gis`):** ФНС России (СМЭВ 3/4), ЕИС Закупки (44-ФЗ / 223-ФЗ).
  * **Коммерческие ИС (`commercial`):** Межбанковский Оракул (ПАО ФинТех & ПлЦР).
  * **Открытые источники (`open`):** Московская Биржа (MOEX Data API).
- Колонки: *«Источник / Система»*, *«Категория ЦБ РФ»*, *«Уровень доверия»*, *«SLA / Доступность»*, *«Модель монетизации»*.
- Цветовые бейджи доверия (**Trust Badges**):
  - 🛡️ **`trust-gis`** (Зеленый / Высокий ГИС) — первичный государственный источник.
  - 💎 **`trust-commercial`** (Синий / Высокий Лицензирован) — сертифицированные финансовые шлюзы.
  - 🌐 **`trust-open`** (Желтый / Средний Маркирован) — биржевые индексы и открытые API.

### 1.2 Предотвращение единой точки отказа (Multi-Oracle Warning):
- Баннер согласно рекомендациям АБР и ЦБ РФ:
  * *«⚠️ Рекомендация ИБ: Для крупномасштабных смарт-контрактов запрещено полагаться на единственный коммерческий источник. Используйте мульти-оракульную агрегацию для предотвращения сбоев и манипуляций.»*

### 1.3 Форма предложения нового источника (Suggest Modal):
- Модальное окно с полями: Название ИС, Категория ЦБ, Формат API (REST, gRPC, SOAP, WebSocket), Контактный email, Описание передаваемых событий.
- Валидация Email регулярным выражением и Pydantic v2, экранирование HTML против XSS / Header Injection.
- Генерация уникального регистрационного номера заявки вида `APP-SRC-XXXXXXXX`.

---

## 2. Архитектура и интеграции

- **Схемы данных:** `backend/models/data_sources.py` (`DataSource`, `DataSourceListResponse`, `DataSourceSuggest`).
- **REST API:** `backend/routers/data_sources.py` (`GET /api/v1/data-sources`, `POST /api/v1/data-sources/suggest`, `GET /data-sources`, `GET /sources`).
- **Интерфейс:** `frontend/templates/data_sources/index.html`, `frontend/static/css/data_sources.css`, `frontend/static/js/data_sources.js`.

---

## 3. Протокол испытаний (QA Protocol)

```text
tests/unit/test_data_sources_api.py ......                               [ 40%]
tests/unit/test_base_routes.py ....                                      [ 12%]
tests/unit/test_builder_api.py ...                                       [ 21%]
tests/unit/test_forum_api.py .........                                   [ 68%]
tests/unit/test_health.py .                                              [ 71%]
tests/unit/test_home_routes.py .....                                     [ 87%]
tests/unit/test_passport_api.py ....                                     [100%]
======================== 32 passed in 0.76s =========================
- Flake8: 0 ошибок (100% PEP8)
- In-Memory TestClient: Все 32 автотеста пройдены успешно
```
