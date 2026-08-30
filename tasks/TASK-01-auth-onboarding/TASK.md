# TASK-01: Модуль аутентификации, онбординга субъектов и верификации E-mail (SMTP)

## 1. Метаданные задачи
- **Идентификатор**: `TASK-01`
- **Наименование**: `auth-onboarding-interface`
- **Тип задачи**: `Frontend / Integration`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-01-auth-onboarding`

---

## 2. Объем выполненных работ (Scope)
1. **Интерфейс входа и регистрации (`public/index.html`, `public/styles.css`, `public/app.js`)**:
   - 3 режима субъектов: **Физическое лицо**, **Индивидуальный предприниматель (ИП)**, **Юридическое лицо (Организация)**.
   - Валидация полей, маскирование номеров телефонов, проверка сложности и совпадения паролей.
2. **Интеграция с сервисами ФНС России (ЕГРЮЛ / ЕГРИП)**:
   - Прямой поиск по ИНН (10 цифр для ЮЛ, 12 цифр для ИП) с проверкой контрольных сумм.
   - Автозаполнение наименований, КПП, ОГРН/ОГРНИП, ФИО предпринимателя/руководителя.
   - Защита от регистрации субъектов на стадии ликвидации или прекративших деятельность.
3. **Защитная графическая капча (Canvas CAPTCHA)**:
   - Клиентская генерация с шумом, линиями искажения и случайными углами поворота символов.
4. **Боевая доставка кодов верификации (Yandex SMTP SSL)**:
   - Отправка 6-значных кодов подтверждения через `smtp.yandex.ru:465`.
   - Полное исключение демо-кодов и подсказок из интерфейса и API.

---

## 3. Статус гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-01-auth-onboarding/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-01-auth-onboarding/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-01-auth-onboarding/UX_SPEC.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-01-auth-onboarding/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-01-auth-onboarding/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-01-auth-onboarding/RELEASE_REPORT.md` — **APPROVED**
