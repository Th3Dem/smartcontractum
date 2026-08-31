# TASK-13: Интеграция главной страницы портала и маршрутизация страницы регистрации/входа на поддомен и путь /auth

## 1. Паспорт задачи
- **Идентификатор**: `TASK-13`
- **Наименование**: `main-landing-page-and-auth-subdomain-routing`
- **Тип задачи**: `Fullstack / Architecture / Routing / Landing Integration`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-13-main-landing-page-and-auth-subdomain-routing`

---

## 2. Объем выполненных работ (Scope)
1. **Главная страница (`public/index.html`)**:
   - Перенос полнофункциональной главной интерактивной страницы-портала из `C:\Users\demya\smartcontractum\index.html` в корень `public/index.html`.
   - Адаптация хедера и кнопок действий («Личный кабинет», «Войти», «Регистрация») с динамической проверкой авторизации (`localStorage.getItem('auth_token')`):
     - Если пользователь авторизован $\rightarrow$ кнопка ведет в Личный кабинет (`dashboard.html`).
     - Если не авторизован $\rightarrow$ переход на страницу авторизации (`/auth.html`).
2. **Страница регистрации и входа (`public/auth.html`)**:
   - Перенос формы входа, регистрации, восстановления пароля и подтверждения почты в `public/auth.html`.
3. **Маршрутизация сервера (`server.py`)**:
   - Поддержка второго уровня домена / поддомена: при обращении к `auth.localhost:3000` или `auth.*` сервер отдает страницу авторизации `auth.html`.
   - Поддержка путей: запросы `/auth`, `/auth/`, `/auth.html`, `/login`, `/register` отдают `auth.html`.
   - Запросы `/`, `/index.html` отдают главную страницу `index.html`.
4. **Тестирование (`tests/test_routing_and_landing.py`, `tests/test_auth_frontend.py`)**:
   - Проверка отдачи главной страницы на `/`.
   - Проверка отдачи страницы авторизации на `/auth`, `/auth.html`, `auth.localhost`.
   - Проверка работы API и Личного кабинета (27/27 PASSED).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-13-main-landing-page-and-auth-subdomain-routing/RELEASE_REPORT.md` — **APPROVED**

