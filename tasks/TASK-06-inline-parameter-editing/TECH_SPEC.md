# TECH_SPEC.md — Архитектурная спецификация: Построчное редактирование параметров (TASK-06)

## 1. Схема взаимодействия API

### 1.1 Точечный запрос на обновление: `POST /api/user/update-profile`
- Клиент передает частичный JSON (только то поле, которое редактируется, либо полный набор):
  ```json
  { "blogTitle": "Новый блог" }
  ```
  или
  ```json
  { "phone": "+7 (999) 555-44-33" }
  ```
- **Сервер (`server.py` + `db.py`)**:
  - `update_user_profile(user_id, data)`:
    - Извлекает текущую запись пользователя.
    - Для переданных ключей валидирует значение и подставляет в `UPDATE`.
    - Для непереданных ключей сохраняет существующие значения.
    - Проверяет E-mail на отсутствие коллизий при его изменении.
    - Возвращает `{ "success": true, "user": sanitized_user }`.

---

## 2. Клиентская архитектура (`dashboard.js` + `dashboard.css`)
- Каждая строка реквизита `.detail-row` имеет атрибут `data-field="key"`.
- Структура строки в режиме чтения:
  ```html
  <div class="detail-row" data-field="last_name">
    <span class="detail-label">Фамилия:</span>
    <div class="detail-val-wrap">
      <span class="detail-val">Иванов</span>
      <button class="btn-row-edit" title="Изменить фамилию">
        <svg>...</svg> <span>Изменить</span>
      </button>
    </div>
  </div>
  ```
- Структура строки в режиме инлайн-редактирования:
  ```html
  <div class="detail-row editing" data-field="last_name">
    <span class="detail-label">Фамилия:</span>
    <div class="detail-edit-wrap">
      <input type="text" class="form-input-inline" value="Иванов">
      <div class="inline-actions">
        <button class="btn-inline-save" title="Сохранить">✓</button>
        <button class="btn-inline-cancel" title="Отмена">✕</button>
      </div>
    </div>
  </div>
  ```
