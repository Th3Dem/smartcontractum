# ⚙️ Инженерный регламент и параметры: design_bot

> **Проект:** SmartContractum Enterprise Platform  
> **Роль:** UI/UX Designer & Design System Lead  
> **Стандарт:** Luxury FinTech Aesthetics & High-Contrast Typography  

---

## 1. Спецификация дизайн-токенов (Design Tokens)

```css
:root {
    /* Фоновые слои */
    --bg-base: #0b0e17;
    --bg-card: #131722;
    --bg-card-hover: #181d2c;
    --border-color: #222531;
    --border-hover: #3861fb;

    /* Акцентные Web3 цвета */
    --accent-blue: #3861fb;
    --accent-cyan: #38bdf8;
    --accent-mint: #16c784;
    --accent-gold: #f6b83f;
    --accent-violet: #8c52ff;

    /* Типографика */
    --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    
    /* Скругления и тени */
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.4);
    --shadow-hover: 0 14px 30px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 97, 251, 0.25);
}
```

---

## 2. Гайдлайн первого экрана (Hero Screen Guidelines)

1. **Девиз (Mission Motto):**
   - Текст: `ИДЕИ · ЛЮДИ · ДАННЫЕ · РЕШЕНИЯ`
   - Стиль: чистая плавающая типографика без плашек, фон прозрачный, цвет `#94a3b8`, трекинг `0.2em`, неоновые точки-разделители `·`.
2. **Главный заголовок (H1):**
   - Первая строка: `Здесь рождаются` (чистый белый `#ffffff`, тень `0 4px 36px rgba(0,0,0,0.95)`).
   - Вторая строка: `смарт-контракты` (градиент `#38bdf8` -> `#6188ff` -> `#16c784`).
3. **Подзаголовок:**
   - Неразрывная конструкция: `...на базе ПКСК <span class="text-nowrap">Банка&nbsp;России.</span>`.
4. **Сетка карточек задач (6 маршрутов):**
   - 3x2 Grid (Desktop), одинаковая высота `230px`, центрированные иконки 54px, плавный лифт `translateY(-6px)`.

---

## 3. Регламент логирования в WORKLOG.md

В каждой записи `WORKLOG.md` раздел `design_bot` обязан содержать:
* Описание композиционных, колористических и типографических решений.
* Обоснование выбора визуальной метафоры и улучшений эргономики.
