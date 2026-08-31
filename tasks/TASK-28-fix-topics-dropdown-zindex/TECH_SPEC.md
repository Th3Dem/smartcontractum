# TECH_SPEC.md — Техническая спецификация исправления z-index (TASK-28)

## 1. Архитектурные изменения в CSS
- В `public/forum_social.css`:
  - `.feed-hero-strip`:
    ```css
    position: relative;
    overflow: visible;
    z-index: 50;
    ```
  - `.feed-hero-container`:
    ```css
    position: relative;
    z-index: 55;
    ```
  - `.feed-hero-topics-row`:
    ```css
    position: relative;
    z-index: 60;
    ```
  - `.feed-topics-dropdown-wrap`:
    ```css
    position: relative;
    z-index: 100;
    ```
  - `.feed-topics-menu`:
    ```css
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: rgba(11, 20, 38, 0.98);
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 12px;
    padding: 6px;
    width: 400px;
    max-width: 90vw;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.25);
    backdrop-filter: blur(20px);
    z-index: 9999;
    ```

## 2. Вердикт
`APPROVED`
