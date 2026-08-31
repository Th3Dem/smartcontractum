# TASK-05: Боковое меню навигации Личного кабинета, раздел «Основные» (с блогом) и раздел «Безопасность» (со сменой пароля)

## 1. Метаданные задачи
- **Идентификатор**: `TASK-05`
- **Наименование**: `dashboard-sidebar-navigation-and-sections`
- **Тип задачи**: `Fullstack (Frontend + Backend + Database + Security + UX)`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-05-dashboard-sidebar-navigation`

---

## 2. Объем выполненных работ (Scope)
1. **Боковая панель навигации Личного кабинета (`public/dashboard.html`, `public/dashboard.css`, `public/dashboard.js`)**:
   - Вынос навигации из верхней шапки в левое боковое меню (Sidebar) с логотипом, ссылками на разделы, переключателем темы оформления и кнопкой выхода.
   - Поддержка адаптивности для мобильных устройств (гамбургер-меню / выдвижная панель).
2. **Раздел «Основные» (`#section-general`)**:
   - Отображение личных данных (Фамилия, Имя, Отчество, Телефон, E-mail, Дата регистрации, реквизиты).
   - **Новое поле**: «Название блога» (`blog_title`).
   - Модальное окно редактирования профиля с возможностью изменения ФИО, телефона, E-mail и названия блога.
3. **Раздел «Безопасность» (`#section-security`)**:
   - Форма смены пароля: ввод текущего пароля, ввод нового пароля, подтверждение пароля, динамическая шкала сложности (Password Strength Meter) и валидация совпадения.
   - Карточка параметров безопасности и 152-ФЗ РФ (хеширование PBKDF2-HMAC-SHA256, SSL/TLS, сессии).
4. **Серверный слой (`server.py`)**:
   - Эндпоинт `POST /api/user/change-password` с проверкой старого пароля и установкой нового хэша с солью.
   - Обновление эндпоинта `POST /api/user/update-profile` для сохранения `blog_title`.
5. **Слой базы данных (`db.py`)**:
   - Добавление колонки `blog_title` в таблицу `users`.
   - Реализация функции `change_user_password(user_id, old_password, new_password)`.
   - Обновление `update_user_profile()` с сохранением `blog_title`.
6. **Тестирование (`tests/test_sidebar_and_security.py`)**:
   - Сквозные тесты смены пароля, обновления названия блога, проверки бокового меню и переключения разделов (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-05-dashboard-sidebar-navigation/RELEASE_REPORT.md` — **APPROVED**

