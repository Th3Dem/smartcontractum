# TASK-07: Смена пароля в разделе «Безопасность» через подтверждение по E-mail коду

## 1. Метаданные задачи
- **Идентификатор**: `TASK-07`
- **Наименование**: `security-email-verification-password-change`
- **Тип задачи**: `Fullstack (Frontend + Backend + SMTP + Security + UX + QA)`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-07-security-email-verification-password-change`

---

## 2. Объем выполненных работ (Scope)
1. **Пользовательский интерфейс раздела «Безопасность» (`public/dashboard.html`, `public/dashboard.css`, `public/dashboard.js`)**:
   - Скрытие прямого ввода текущего пароля в открытом виде.
   - Начальный экран с кнопкой «🔐 Сменить пароль» и отображением почты, на которую будет направлен код.
   - 3-шаговый интерактивный мастер (Wizard) смены пароля:
     - **Шаг 1**: Клик по кнопке «Сменить пароль» $\rightarrow$ мгновенная отправка 6-значного кода на зарегистрированный E-mail через Яндекс SMTP.
     - **Шаг 2**: Экран ввода 6-значного кода из письма с таймером повторной отправки (60 сек) и валидацией.
     - **Шаг 3**: Экран ввода нового пароля с интерактивной шкалой сложности (Password Strength Meter) и валидатором совпадения паролей.
2. **Серверный слой и Безопасность (`server.py`, `db.py`)**:
   - Эндпоинт `POST /api/security/request-password-change` (Bearer auth) для генерации кода и отправки SMTP-письма.
   - Эндпоинт `POST /api/security/verify-password-code` (Bearer auth) для безопасной проверки кода через `hmac.compare_digest` и выдачи одноразового `changeToken`.
   - Эндпоинт `POST /api/security/change-password-verified` (Bearer auth) для PBKDF2-HMAC-SHA256 хеширования и обновления в SQLite.
3. **Автоматическое тестирование (`tests/test_security_flow.py`)**:
   - Unit и Integration тесты всех трех шагов API (100% OK).
   - Проверка защиты от неавторизованного доступа, истечения сроков токенов и неверных кодов.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-07-security-email-verification-password-change/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-07-security-email-verification-password-change/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-07-security-email-verification-password-change/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-07-security-email-verification-password-change/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-07-security-email-verification-password-change/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-07-security-email-verification-password-change/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-07-security-email-verification-password-change/RELEASE_REPORT.md` — **APPROVED**

