# DEV_HANDOVER.md — Передача функционала позиционирования иконки «глаз» (TASK-09)

## 1. Состав артефактов разработки
| Файл | Описание изменений |
|---|---|
| [`public/dashboard.html`](file:///home/dem/Projects_01/public/dashboard.html) | Поля ввода «Новый пароль» и «Подтверждение нового пароля» обернуты в `.input-wrapper`, кнопки переключения видимости пароля снабжены классами `.input-suffix-btn.btn-toggle-pwd`. |
| [`public/styles.css`](file:///home/dem/Projects_01/public/styles.css) | Добавлен отступ справа `.input-wrapper .form-input { padding-right: 42px; }` для предотвращения наложения вводимого текста на иконку. |
| [`public/dashboard.js`](file:///home/dem/Projects_01/public/dashboard.js) | Обработчик `.btn-toggle-pwd` обновлен для работы с `.input-wrapper`. |
| [`tests/test_security_flow.py`](file:///home/dem/Projects_01/tests/test_security_flow.py) | Добавлены автотесты на наличие классов `.input-wrapper` и `.input-suffix-btn btn-toggle-pwd`. |

---

## 2. Инструкции по тестированию
1. Запуск автотестов:
   ```bash
   python3 -m unittest discover tests
   ```
2. Визуальная проверка:
   - В Личном кабинете перейти в «Безопасность» $\rightarrow$ «Сменить пароль» $\rightarrow$ ввести проверочный код.
   - Убедиться, что иконка `👁` находится внутри поля ввода справа.
   - Ввести пароль $\rightarrow$ нажать на `👁` $\rightarrow$ пароль становится видимым, иконка меняется на `🙈`.
