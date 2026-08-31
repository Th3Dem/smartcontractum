# TASK-09: Позиционирование иконки видимости пароля («глаз») внутри поля ввода (Раздел «Безопасность»)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-09`
- **Наименование**: `security-password-input-eye-icon-positioning`
- **Тип задачи**: `Frontend UX / UI / Consistency / QA`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-09-security-password-input-eye-icon-positioning`

---

## 2. Объем выполненных работ (Scope)
1. **HTML-разметка (`public/dashboard.html`)**:
   - Замена контейнеров полей «Новый пароль» и «Подтверждение нового пароля» на `.input-wrapper`.
   - Применение класса `.input-suffix-btn.btn-toggle-pwd` к кнопкам переключения видимости пароля.
2. **Стилизация CSS (`public/styles.css` / `public/dashboard.css`)**:
   - Абсолютное позиционирование иконки `👁` справа внутри строки инпута (`position: absolute; right: 10px;`).
   - Добавление `padding-right: 42px` для `.form-input` внутри `.input-wrapper`, чтобы текст не накладывался на кнопку.
3. **Логика JavaScript (`public/dashboard.js`)**:
   - Обеспечение надежного поиска инпута по `.closest('.input-wrapper')` при клике на иконку.
4. **Тестирование (`tests/test_security_flow.py`)**:
   - Автоматическая проверка наличия `.input-wrapper` и `.input-suffix-btn` в форме смены пароля `dashboard.html`.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-09-security-password-input-eye-icon-positioning/RELEASE_REPORT.md` — **APPROVED**

