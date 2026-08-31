# DEV_HANDOVER.md — Передача функционала главной страницы и роутинга авторизации (TASK-13)

## 1. Состав артефактов разработки
| Файл | Описание изменений |
|---|---|
| [`public/index.html`](file:///home/dem/Projects_01/public/index.html) | Главная интерактивная страница портала SmartContractum (перенесена из исходного проекта `C:\Users\demya\smartcontractum\index.html`). В шапку интегрирована умная кнопка `#authNavBtn` («Личный кабинет» для авторизованных, «Войти / Регистрация» для гостей). |
| [`public/auth.html`](file:///home/dem/Projects_01/public/auth.html) | Полнофункциональный портал авторизации (вход, регистрация 3 типов с ФНС, 2FA E-mail, сброс пароля) со ссылкой «← На главную». |
| [`server.py`](file:///home/dem/Projects_01/server.py) | Реализован роутинг поддомена `auth.*` (`auth.localhost:3000`, `auth.smartcontractum.ru`) и путей `/auth`, `/auth.html`, `/login`, `/register` на страницу `auth.html`. На `/` отдается главная страница `index.html`. |
| [`tests/test_routing_and_landing.py`](file:///home/dem/Projects_01/tests/test_routing_and_landing.py) | Автоматические тесты маршрутизации корня, поддомена и путей авторизации. |

---

## 2. Инструкции по тестированию
1. Запуск автотестов:
   ```bash
   python3 -m unittest discover tests
   ```
2. Проверка в браузеру:
   - Открыть `http://localhost:3000/` $\rightarrow$ открывается главная страница портала SmartContractum.
   - Нажать кнопку «Войти / Регистрация» в правом верхнем углу $\rightarrow$ открывается страница входа `/auth.html`.
   - Ввести логин и пароль $\rightarrow$ вход в личный кабинет `dashboard.html`.
   - Вернуться на `http://localhost:3000/` $\rightarrow$ кнопка в шапке автоматически отображает «Личный кабинет (Имя) →».
