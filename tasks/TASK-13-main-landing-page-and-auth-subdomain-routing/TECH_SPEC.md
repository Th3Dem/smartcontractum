# TECH_SPEC.md — Архитектурная спецификация роутинга и структуры файлов (TASK-13)

## 1. Структура файлов в каталоге `public/`
| Файл | Назначение |
|---|---|
| `public/index.html` | Главная страница портала SmartContractum (перенесена из `C:\Users\demya\smartcontractum\index.html` с интеграцией авторизации). |
| `public/auth.html` | Страница авторизации, регистрации (Физлицо, ИП, Юрлицо с ЕГРЮЛ/ЕГРИП), сброса пароля и 2FA подтверждения E-mail. |
| `public/app.js` | Логика авторизации, валидации, капчи и регистрации. |
| `public/styles.css` | Стили формы авторизации и общие стили. |
| `public/dashboard.html` | Личный кабинет пользователя с боковым меню «Основные» / «Безопасность». |
| `public/dashboard.js` | Логика личного кабинета, инлайн-редактирования и 2FA смены пароля. |
| `public/dashboard.css` | Стили личного кабинета. |

---

## 2. Маршрутизация в `server.py`
```python
def do_GET(self):
    parsed = urllib.parse.urlparse(self.path)
    host = self.headers.get("Host", "").lower().split(":")[0]

    # Поддомен auth.* (например auth.localhost, auth.smartcontractum.ru)
    if host.startswith("auth."):
        if parsed.path in ["/", "/index.html", "/auth", "/auth.html", "/login", "/register"]:
            self.serve_file(os.path.join(PUBLIC_DIR, "auth.html"), "text/html; charset=utf-8")
            return

    # Пути авторизации
    if parsed.path in ["/auth", "/auth/", "/auth.html", "/login", "/register"]:
        self.serve_file(os.path.join(PUBLIC_DIR, "auth.html"), "text/html; charset=utf-8")
        return

    # Главная страница
    if parsed.path in ["/", "/index.html"]:
        self.serve_file(os.path.join(PUBLIC_DIR, "index.html"), "text/html; charset=utf-8")
        return

    # Личный кабинет
    if parsed.path in ["/dashboard", "/dashboard/"]:
        self.serve_file(os.path.join(PUBLIC_DIR, "dashboard.html"), "text/html; charset=utf-8")
        return

    # API и стандартная раздача статики
    ...
```
