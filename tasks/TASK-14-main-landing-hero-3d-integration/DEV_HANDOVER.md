# DEV_HANDOVER.md — Передача функционала 3D Hero главной страницы (TASK-14)

## 1. Состав артефактов разработки
| Файл | Описание |
|---|---|
| [`public/index.html`](file:///home/dem/Projects_01/public/index.html) | Главная страница экосистемы с 3D Blockchain Cube, квантовым ядром, космическими частицами, дорожной картой Банка России и созвездием сервисов. |
| [`public/hero.css`](file:///home/dem/Projects_01/public/hero.css) | Стили 3D-куба, осей координат, орбитальных колец и сателлитов. |
| [`public/hero_constellation.css`](file:///home/dem/Projects_01/public/hero_constellation.css) | Стили интерактивного графа созвездий сервисов и ролей. |
| [`public/landing_main.css`](file:///home/dem/Projects_01/public/landing_main.css) | Базовые стили разметки, хедера, футера и карточек. |
| [`public/hero.js`](file:///home/dem/Projects_01/public/hero.js) | Скрипт 3D-параллакса, вращения куба и динамической подгрузки метрик. |
| [`public/hero_constellation.js`](file:///home/dem/Projects_01/public/hero_constellation.js) | Canvas-рендерер частиц и связей графа созвездий. |
| [`public/landing_main.js`](file:///home/dem/Projects_01/public/landing_main.js) | Интерактив мобильного меню и модальных окон. |
| [`server.py`](file:///home/dem/Projects_01/server.py) | Реализован эндпоинт `/api/v1/system/stats` для динамических счетчиков платформы. |

---

## 2. Инструкции по проверке
1. Запуск тестов: `python3 -m unittest discover tests` (28/28 OK).
2. Браузерная проверка:
   - Открыть `http://localhost:3000/` $\rightarrow$ отображается заголовок **«Здесь рождаются российские смарт-контракты»** и анимированный 3D куб с созвездиями.
   - Проверить переходы по кнопкам сценариев и дорожной карты.
   - Проверить кнопку входа в шапке.
