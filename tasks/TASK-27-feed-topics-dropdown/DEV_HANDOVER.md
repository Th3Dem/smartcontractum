# DEV_HANDOVER.md — Передача выпадающего списка «Темы» (TASK-27)

## 1. Состав артефактов разработки
| Файл | Описание |
|---|---|
| [`public/feed.html`](file:///home/dem/Projects_01/public/feed.html) | В Hero-блок добавлена кнопка `.btn-feed-topics` с выпадающим меню компетенций «Темы». |
| [`public/forum_social.css`](file:///home/dem/Projects_01/public/forum_social.css) | Стилизована кнопка, бейдж выбранной темы `.topics-active-badge` и выпадающее меню `.feed-topics-menu`. |
| [`public/forum_social.js`](file:///home/dem/Projects_01/public/forum_social.js) | Реализованы открытие меню, выбор компетенции с фильтрацией публикаций и обновление активного лейбла темы. |

---

## 2. Результаты верификации
- Запуск тестов: `python3 -m unittest discover tests` (30 / 30 PASSED, 100% OK).
- Проверена фильтрация ленты при клике по темам и закрытие меню по клику вне области.
