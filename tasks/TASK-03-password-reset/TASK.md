# TASK-03: Механизм трехэтапного сброса пароля (E-mail код, верификация, смена пароля)

## 1. Метаданные задачи
- **Идентификатор**: `TASK-03`
- **Наименование**: `password-reset-multistep-flow`
- **Тип задачи**: `Fullstack (Frontend + Backend + Database + Security + SMTP)`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-03-password-reset`

---

## 2. Объем выполненных работ (Scope)
1. **Сценарий восстановления доступа на странице авторизации (`public/index.html`, `public/app.js`, `public/styles.css`)**:
   - **Шаг 1 (Запрос сброса)**: Ввод E-mail и Canvas-капчи, нажатие кнопки «Отправить код для сброса пароля».
   - **Шаг 2 (Ввод проверочного кода)**: Окно ввода 6-значного кода из E-mail, обратный таймер (60 сек) и возможность повторной отправки.
   - **Шаг 3 (Установка нового пароля)**: Окно ввода нового пароля с подтверждением, индикатором сложности (Password Strength Meter) и валидацией совпадения.
2. **Серверный слой (`server.py`)**:
   - `POST /api/auth/forgot-password`: проверка пользователя в БД, генерация 6-значного кода с TTL 10 минут, отправка брендированного HTML-письма через Яндекс SMTP SSL.
   - `POST /api/auth/forgot-verify-code`: валидация 6-значного кода, выдача одноразового криптографического токена сброса (`reset_token`).
   - `POST /api/auth/forgot-reset-password`: проверка токена сброса, валидация сложности нового пароля и вызов обновления в БД.
3. **Слой базы данных и криптографии (`db.py`)**:
   - Добавление функций `get_user_by_email()` и `update_user_password()`.
   - Хеширование нового пароля по стандарту **PBKDF2-HMAC-SHA256** (100 000 итераций, новая случайная соль 16 байт).
   - Инвалидация всех активных сессий пользователя при смене пароля.
4. **Тестирование (`tests/test_password_reset.py`)**:
   - Сквозные автоматические тесты полного цикла сброса пароля и последующей авторизации (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-03-password-reset/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-03-password-reset/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-03-password-reset/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-03-password-reset/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-03-password-reset/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-03-password-reset/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-03-password-reset/RELEASE_REPORT.md` — **APPROVED**

