# TASK-18: Обновление кнопки в правом верхнем углу — замена отображения ФИО на кнопку «Выйти» при авторизованной сессии

## 1. Паспорт задачи
- **Идентификатор**: `TASK-18`
- **Наименование**: `header-auth-logout-button`
- **Тип задачи**: `Frontend / UX / Header Session State & Logout Action`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-18-header-auth-logout-button`

---

## 2. Объем выполненных работ (Scope)
1. **Обновление логики шапки (`public/index.html` и `public/feed.html`)**:
   - Когда пользователь **НЕ авторизован**: кнопка в правом верхнем углу отображает «Войти / Регистрация» и ведет на `/auth.html`.
   - Когда пользователь **авторизован** (`auth_token` присутствует в `localStorage`): кнопка отображает **«Выйти»** (без вывода ФИО / имени), клик по кнопке сбрасывает сессию (`auth_token`, `user_profile`, `user`) и перезагружает страницу / возвращает состояние гостя.
2. **Скрипты**:
   - Синхронизирована логика в `public/index.html` и `public/forum_social.js`.
3. **Тестирование**:
   - 30 / 30 PASSED (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-18-header-auth-logout-button/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-18-header-auth-logout-button/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-18-header-auth-logout-button/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-18-header-auth-logout-button/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-18-header-auth-logout-button/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-18-header-auth-logout-button/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-18-header-auth-logout-button/RELEASE_REPORT.md` — **APPROVED**

