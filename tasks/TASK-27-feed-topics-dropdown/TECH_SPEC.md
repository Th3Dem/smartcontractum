# TECH_SPEC.md — Техническая спецификация выпадающего списка «Темы» (TASK-27)

## 1. Архитектура компонента
- В `public/feed.html`:
  ```html
  <div class="feed-hero-topics-row">
      <div class="feed-cat-dropdown-wrap" id="feedTopicsDropdownWrap">
          <button type="button" class="btn-feed-topics" id="btnFeedTopicsDropdown" aria-haspopup="true" aria-expanded="false">
              <svg class="topics-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                  <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
              </svg>
              <span class="topics-btn-text">Темы</span>
              <span class="topics-active-badge" id="currentTopicLabel">Все темы</span>
              <span class="topics-arrow">▼</span>
          </button>
          <div class="feed-topics-menu" id="feedTopicsMenu" style="display: none;">
              <div class="topic-menu-item is-active" data-cat="all">⚡ Все темы</div>
              <div class="topic-menu-item" data-cat="smart-contracts">💻 Разработка смарт-контрактов &amp; EVM/Yul</div>
              <div class="topic-menu-item" data-cat="security">🛡️ Информационная безопасность, аудит &amp; ГОСТ</div>
              <div class="topic-menu-item" data-cat="oracles">🌐 Рынок внешних данных &amp; Реестр оракулов</div>
              <div class="topic-menu-item" data-cat="cbrf-law">🏛️ Регуляторика, ЦБ РФ &amp; Цифровой рубль</div>
              <div class="topic-menu-item" data-cat="escrow-b2b">💼 Смарт-эскроу &amp; 1C:Предприятие</div>
              <div class="topic-menu-item" data-cat="marketplace-jobs">💰 Биржа заказов &amp; Проектные команды</div>
          </div>
      </div>
  </div>
  ```
- В `public/forum_social.js`:
  - Навесить клик на `#btnFeedTopicsDropdown` для переключения меню.
  - Обработка выбора `.topic-menu-item` с синхронизацией `activeCat` и `applyFilters()`.

## 2. Вердикт
`APPROVED`
