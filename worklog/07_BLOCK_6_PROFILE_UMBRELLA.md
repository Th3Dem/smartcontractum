# 👤 Инженерный журнал: БЛОК 6 — Профиль Специалиста & Umbrella-Workspace (07_BLOCK_6_PROFILE_UMBRELLA.md)

> **Проект:** SmartContractum Enterprise Platform  
> **Статус:** Реализован и Завершен (100% Green)  
> **Дата реализации:** 2026-08-20 00:05:00  
> **Исполнители:** `pm_bot`, `py_bot`, `ui_bot`, `qa_bot`, `devops_bot`

---

## 1. Спецификация и состав реализованного функционала

### 1.1 Профиль специалиста (LinkedIn-Style & Professional Trail):
- Карточка профиля с аватаром, аккредитационным бейджем и рейтингом эксперта (**Top 1% Комплаенс, 985 pts**).
- Теги компетенций (`#FastAPI`, `#SmartContracts`, `#Audit`, `#CBDC`, `#Python`, `#LowCode`, `#ПКСК_2026`).
- Метрики профессионального следа:
  * **18** *Создано Паспортов*
  * **7** *Опубликовано контрактов*
  * **42** *Ответов на форуме*
  * **14** *Проведено пред-аудитов ИБ*

### 1.2 Umbrella-Кабинет Разработчика (Umbrella Developer Workspace):
- Юридический мост: независимые разработчики публикуют контракты на ПКСК через аккредитованное юрлицо SmartContractum.
- Модальное окно подачи смарт-контракта на публикацию с валидацией роялти (от 0.1% до 50.0%) и согласием с лицензионным договором.
- Таблица управления контрактами с отслеживанием стадий жизненного цикла:
  * `Draft` $\to$ `Пред-Аудит ИБ (Внутренний)` $\to$ `Передан Оператору ПКСК` $\to$ `Опубликован на Витрине ПКСК`.

### 1.3 Калькулятор и трекер роялти (Earnings Dashboard):
- Финансовые виджеты:
  * **1 840** *Всего исполнений на ПлЦР*
  * **184 000 ₽** *Начислено роялти (Цифровые Рубли / CBDC)*
  * **42 500 ₽** *Доступно к выводу* (Регламентная выплата 1-го числа каждого месяца)
- Журнал транзакционных начислений комиссии (Ledger) с хэшами транзакций и статусами выплат.

---

## 2. Архитектура и интеграции

- **Схемы данных:** `backend/models/profile.py` (`UserProfile`, `UmbrellaContract`, `RoyaltyLedger`, `UmbrellaSubmitRequest`).
- **REST API:** `backend/routers/profile.py` (`GET /profile`, `GET /api/v1/profile/me`, `POST /api/v1/profile/umbrella/submit`, `GET /api/v1/profile/umbrella/earnings`).
- **Интерфейс:** `frontend/templates/profile/index.html`, `frontend/static/css/profile.css`, `frontend/static/js/profile.js`.

---

## 3. Протокол испытаний (QA Protocol)

```text
tests/unit/test_profile_api.py ......                                    [100%]
tests/unit/test_base_routes.py ....                                      [ 10%]
tests/unit/test_builder_api.py ...                                       [ 18%]
tests/unit/test_data_sources_api.py ......                               [ 34%]
tests/unit/test_forum_api.py .........                                   [ 57%]
tests/unit/test_health.py .                                              [ 60%]
tests/unit/test_home_routes.py .....                                     [ 73%]
tests/unit/test_passport_api.py ....                                     [ 84%]
======================== 38 passed in 1.00s =========================
- Flake8: 0 ошибок (100% PEP8)
- In-Memory TestClient: Все 38 автотестов пройдены успешно
```
