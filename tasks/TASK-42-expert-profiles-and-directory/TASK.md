# TASK-42: Публичный профиль эксперта и каталог специалистов рынка смарт-контрактов (Этап 1)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-42`
- **Наименование**: `expert-profiles-and-directory`
- **Тип задачи**: `Fullstack / Catalog / Profiles / Search / Directory Engine`
- **Статус**: `IN_PROGRESS`
- **Ветка**: `feat/TASK-42-expert-profiles-and-directory`
- **Ответственный PM**: `pm_bot`

---

## 2. Объем выполняемых работ (Scope)
1. **База данных (`db.py`)**:
   - Реализовать методы выборки каталога специалистов `get_experts_directory(competency, search, limit, offset)`.
   - Реализовать метод формирования детального профиля `get_expert_profile(user_id)` со статистикой (очки репутации, принятые решения Q&A, написанные статьи, верифицированные реквизиты).
2. **Серверный слой (`server.py`)**:
   - Маршрутизация страницы каталога `/experts`, `/experts/`, `/experts.html`.
   - REST API:
     - `GET /api/experts` — получение каталога специалистов с фильтрами по компетенциям и поиску.
     - `GET /api/experts/<id>` — получение полного профиля эксперта и его материалов.
3. **Клиентский интерфейс (`public/experts.html`, `public/experts.js`, `public/experts.css`)**:
   - Каталог специалистов рынка смарт-контрактов:
     - Фильтры по ключевым компетенциям: `Все эксперты`, `⚡ Разработка EVM`, `🛡️ Аудит ИБ`, `🌐 Оракулы`, `🏛️ Право & ЦБ РФ`, `💼 1C:Эскроу`.
     - Карточки специалистов с бейджами верификации, репутацией, списком подтвержденных навыков, кнопками «Подписаться» и «Связаться / Предложить проект».
     - Модальный просмотр детального профиля эксперта со списком его принятых решений и публикаций.
     - Поддержка темной и светлой темы оформления (Dark / Light).
4. **Навигация**:
   - Добавление ссылки на раздел `Эксперты` в шапку и сайдбар `feed.html`, `index.html`, `dashboard.html`.
5. **Тестирование (`tests/test_experts_directory.py`)**:
   - Автоматизированные тесты БД, REST API и маршрутизации каталога экспертов.
   - 100% успешное прохождение всех тестов платформы.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [ ] **Product Gate**: `tasks/TASK-42-expert-profiles-and-directory/PRODUCT_SPEC.md`
- [ ] **Architecture Gate**: `tasks/TASK-42-expert-profiles-and-directory/TECH_SPEC.md`
- [ ] **UX Gate**: `tasks/TASK-42-expert-profiles-and-directory/UX_SPEC.md`
- [ ] **Data Gate**: `tasks/TASK-42-expert-profiles-and-directory/DATA_REVIEW.md`
- [ ] **Security Gate**: `tasks/TASK-42-expert-profiles-and-directory/SECURITY_REVIEW.md`
- [ ] **QA Gate**: `tasks/TASK-42-expert-profiles-and-directory/QA_REVIEW.md`
- [ ] **Release Gate**: `tasks/TASK-42-expert-profiles-and-directory/RELEASE_REPORT.md`
