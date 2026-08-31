# DEV_HANDOVER.md — Передача функционала двухфакторной смены пароля (TASK-07)

## 1. Состав артефактов разработки
| Файл | Описание изменений |
|---|---|
| [`server.py`](file:///home/dem/Projects_01/server.py) | Реализовано хранилище `SECURITY_PASSWORD_RESET_SESSIONS` и 3 защищенных эндпоинта: `POST /api/security/request-password-change`, `POST /api/security/verify-password-code`, `POST /api/security/change-password-verified`. |
| [`public/dashboard.html`](file:///home/dem/Projects_01/public/dashboard.html) | Форма прямого ввода текущего пароля заменена на интерактивный 3-шаговый мастер смены пароля (Шаг 1: Кнопка «Сменить пароль» $\rightarrow$ Шаг 2: Ввод проверочного 6-значного кода $\rightarrow$ Шаг 3: Ввод нового пароля). |
| [`public/dashboard.css`](file:///home/dem/Projects_01/public/dashboard.css) | Стилизованы экраны мастера: `.sec-init-info`, `.sec-step-header`, `.form-input-code`, `.sec-actions-row`, `.btn-resend-code`. |
| [`public/dashboard.js`](file:///home/dem/Projects_01/public/dashboard.js) | Реализован сценарий смены пароля: обработчик кнопки «Сменить пароль», отправка запроса кода, таймер кулдауна (60 сек), верификация кода и сохранение нового пароля. |

---

## 2. Инструкции по тестированию
1. Запуск автоматических тестов:
   ```bash
   python3 -m unittest tests/test_security_flow.py
   python3 -m unittest discover tests
   ```
2. Ручная проверка:
   - В Личном кабинете перейти на вкладку **«Безопасность»**.
   - Нажать кнопку **«🔐 Сменить пароль»**.
   - Дождаться получения 6-значного кода на E-mail (или взять из лога SMTP).
   - Ввести код в поле $\rightarrow$ открывается экран ввода нового пароля.
   - Ввести надежный новый пароль и подтверждение $\rightarrow$ нажать **«Сохранить новый пароль»**.
   - Убедиться в выводе зеленого уведомления и возврате на начальный экран.
