# DEV_HANDOVER.md — Передача функционала Ленты сообщества и Редактора (TASK-15)

## 1. Состав артефактов разработки
| Файл | Описание |
|---|---|
| [`public/index.html`](file:///home/dem/Projects_01/public/index.html) | Обновлено главное навигационное меню: удалены пункты «Сценарии», «Дорожная карта», «Авторизация», установлен единственный пункт **«Лента»** (`/feed`). |
| [`public/feed.html`](file:///home/dem/Projects_01/public/feed.html) | Полнофункциональная лента сообщества и База знаний (Хабр 2.0) с категориями, табами, поиском, карма-левером, закладками и комментариями. |
| [`public/editor.html`](file:///home/dem/Projects_01/public/editor.html) | Профессиональный WYSIWYG / Markdown редактор статей и смарт-контрактов со сплит-предпросмотром, автосохранением и типографом. |
| [`public/forum_social.css`](file:///home/dem/Projects_01/public/forum_social.css) | Стили ленты публикаций, карточек статей и сайдбара. |
| [`public/forum_editor.css`](file:///home/dem/Projects_01/public/forum_editor.css) | Стили панели инструментов редактора и сплит-экрана. |
| [`public/forum_social.js`](file:///home/dem/Projects_01/public/forum_social.js) | Скрипты интерактива ленты и реакций. |
| [`server.py`](file:///home/dem/Projects_01/server.py) | Маршрутизация `/feed`, `/feed/`, `/feed.html`, `/forum`, `/editor`, `/editor/`, `/editor.html`. |
| [`tests/test_routing_and_landing.py`](file:///home/dem/Projects_01/tests/test_routing_and_landing.py) | Тесты роутинга ленты и редактора. |

---

## 2. Инструкции по проверке
1. `python3 -m unittest discover tests` (30 / 30 PASSED).
2. Браузерная проверка:
   - Открыть `http://localhost:3000/` $\rightarrow$ в шапке отображается логотип и пункт «Лента».
   - Клик по «Лента» $\rightarrow$ переход на `http://localhost:3000/feed`.
   - Клик по «Написать статью» в ленте $\rightarrow$ переход на `http://localhost:3000/editor`.
