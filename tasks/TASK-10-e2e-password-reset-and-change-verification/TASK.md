# TASK-10: Комплексная сквозная проверка и аудит механизмов сброса и смены паролей

## 1. Паспорт задачи
- **Идентификатор**: `TASK-10`
- **Наименование**: `e2e-password-reset-and-change-verification`
- **Тип задачи**: `QA / Security / E2E Verification / Database Audit`
- **Статус**: `COMPLETED`
- **Ветка**: `test/TASK-10-e2e-password-reset-and-change-verification`

---

## 2. Объем выполненных работ (Scope)
1. **Сквозная проверка 1: Сброс пароля (Forgot Password Flow на странице входа)**:
   - Создание тестового пользователя с паролем `Password_A_123!`.
   - Вызов `POST /api/auth/forgot-password` $\rightarrow$ получение кода.
   - Вызов `POST /api/auth/forgot-verify-code` $\rightarrow$ получение `resetToken`.
   - Вызов `POST /api/auth/forgot-reset-password` $\rightarrow$ установка нового пароля `Password_B_456!`.
   - Прямой аудит БД: проверка изменения `password_hash` и `password_salt` в таблице `users`.
   - Проверка авторизации: логин со старым паролем `Password_A_123!` отклоняется, логин с новым паролем `Password_B_456!` успешен.
2. **Сквозная проверка 2: Двухфакторная смена пароля в Личном кабинете (Security Tab Flow)**:
   - Вход под паролем `Password_B_456!` $\rightarrow$ получение активного Bearer-токена.
   - Вызов `POST /api/security/request-password-change` $\rightarrow$ генерация кода.
   - Вызов `POST /api/security/verify-password-code` $\rightarrow$ валидация кода и выдача `changeToken`.
   - Вызов `POST /api/security/change-password-verified` $\rightarrow$ установка нового пароля `Password_C_789!`.
   - Прямой аудит БД: проверка повторного обновления `password_hash` и `password_salt`.
   - Проверка авторизации: логин с `Password_B_456!` отклоняется, логин с `Password_C_789!` успешен с получением всех реквизитов.
3. **Автоматизация проверки (`tests/test_e2e_password_flows.py`)**:
   - Создан выделенный сьют тестов сквозной верификации (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-10-e2e-password-reset-and-change-verification/RELEASE_REPORT.md` — **APPROVED**

