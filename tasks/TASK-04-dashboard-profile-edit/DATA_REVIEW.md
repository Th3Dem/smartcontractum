# DATA_REVIEW.md — Аудит модели данных и SQL-запросов (TASK-04)

## 1. Анализ схемы БД `smartcontractum.db`
Таблица `users` содержит следующие поля, модифицируемые при редактировании:
- `email TEXT UNIQUE NOT NULL`
- `phone TEXT`
- `last_name TEXT`, `first_name TEXT`, `middle_name TEXT`
- `ip_last_name TEXT`, `ip_first_name TEXT`, `ip_middle_name TEXT`
- `rep_last_name TEXT`, `rep_first_name TEXT`

---

## 2. Проверка SQL-запросов
1. **Проверка уникальности E-mail**:
   ```sql
   SELECT id FROM users WHERE email = ? AND id != ?
   ```
   Использует уникальный индекс по столбцу `email`. Выполняется за $O(1)$ без полного сканирования таблицы.
2. **Параметризованное обновление**:
   ```sql
   UPDATE users SET last_name = ?, first_name = ?, middle_name = ?, phone = ?, email = ? WHERE id = ?
   ```
   Исключает риск SQL-инъекций (SQL Injection).

---

## 3. Вердикт
Слой данных оптимизирован, безопасен и полностью готов к реализации.
**Статус**: `APPROVED`.
