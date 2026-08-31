# TASK-40: Ядро Q&A, персистентное хранение публикаций, ответов и механика репутации (Этап 1)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-40`
- **Наименование**: `qa-core-and-reputation`
- **Тип задачи**: `Fullstack / Database / REST API / Q&A & Reputation Engine`
- **Статус**: `IN_PROGRESS`
- **Ветка**: `feat/TASK-40-qa-core-and-reputation`
- **Ответственный PM**: `pm_bot`

---

## 2. Объем выполняемых работ (Scope)
1. **База данных (`db.py`)**:
   - Создать таблицы `feed_posts`, `feed_comments`, `feed_reactions`, `feed_votes`, `user_reputation`.
   - Реализовать методы создания постов, комментариев/ответов, выборки с фильтрами, голосования за полезность.
   - Реализовать транзакционную логику принятия ответа (`accept_answer`) с фиксацией `is_solved = 1` и начислением `+50` очков репутации автору ответа.
   - Реализовать персистентный сидинг базовых материалов экосистемы при первичной инициализации.
2. **Серверный REST API (`server.py`)**:
   - `GET /api/feed/posts` — получение списка постов с фильтрами по типу, категории и поиску.
   - `GET /api/feed/posts/<id>` — получение конкретной публикации.
   - `POST /api/feed/posts` — публикация вопроса, статьи, обсуждения, кейса или поста.
   - `GET /api/feed/posts/<id>/comments` — получение ветки комментариев/ответов.
   - `POST /api/feed/posts/<id>/comments` — добавление ответа или комментария.
   - `POST /api/feed/posts/<id>/accept-answer` — отметка ответа как принятого решения.
   - `POST /api/feed/posts/<id>/vote` — оценка полезности («Полезно ▲ / ▼»).
3. **Клиентский слой (`public/forum_social.js`, `public/feed.html`)**:
   - Динамическая загрузка публикаций из API при старте с сохранением клиентской интерактивности.
   - Отправка новых вопросов и постов из модального окна на сервер.
   - Отправка и разворачивание ответов на вопросы с кнопкой «Принять ответ».
   - Отображение актуального рейтинга репутации авторов.
4. **Тестирование (`tests/test_qa_and_feed.py`)**:
   - Автоматизированное сквозное тестирование создания постов, ответов, принятия лучшего ответа, начисления репутации и REST API.
   - 100% успешное прохождение всех тестов платформы.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [ ] **Product Gate**: `tasks/TASK-40-qa-core-and-reputation/PRODUCT_SPEC.md`
- [ ] **Architecture Gate**: `tasks/TASK-40-qa-core-and-reputation/TECH_SPEC.md`
- [ ] **UX Gate**: `tasks/TASK-40-qa-core-and-reputation/UX_SPEC.md`
- [ ] **Data Gate**: `tasks/TASK-40-qa-core-and-reputation/DATA_REVIEW.md`
- [ ] **Security Gate**: `tasks/TASK-40-qa-core-and-reputation/SECURITY_REVIEW.md`
- [ ] **QA Gate**: `tasks/TASK-40-qa-core-and-reputation/QA_REVIEW.md`
- [ ] **Release Gate**: `tasks/TASK-40-qa-core-and-reputation/RELEASE_REPORT.md`
